import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Local‑First Portfolio Tracker — Dark Mode, Form UI (single‑file React component)
 * - Dark theme UI (Tailwind classes)
 * - Form-based asset editing (no JSON), add/remove items per type
 * - Allocation editor with % targets
 * - Rebalance helper: enter "new capital" and get invest suggestions (no selling assumed)
 * - Historical snapshots stored in a single encrypted portfolio file
 * - Net-worth chart (monthly/yearly)
 * - Encryption: AES‑GCM 256 with PBKDF2 (SHA‑256)
 *
 * Best in Chromium browsers (Chrome/Edge/Opera) with File System Access API.
 */

// ------------------------------
// Minimal IndexedDB helpers to persist the file handle
// ------------------------------
const DB_NAME = "portfolio-tracker-db";
const STORE = "handles";

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key, value) {
  const db = await idbOpen();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// ------------------------------
// Crypto helpers (WebCrypto): AES-GCM + PBKDF2
// File layout (binary): [ magic(8) | salt(16) | iv(12) | ciphertext ]
// ------------------------------
const MAGIC = new TextEncoder().encode("PTv1.enc"); // 8 bytes

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function concatBytes(...parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

async function encryptJson(obj, password) {
  const plaintext = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const payload = concatBytes(new Uint8Array(MAGIC), salt, iv, ciphertext);
  return payload;
}

async function decryptJson(buf, password) {
  const data = new Uint8Array(buf);
  const magic = data.slice(0, 8);
  if (!equalBytes(magic, MAGIC)) throw new Error("Invalid file format");
  const salt = data.slice(8, 24);
  const iv = data.slice(24, 36);
  const ciphertext = data.slice(36);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const json = new TextDecoder().decode(new Uint8Array(plaintext));
  return JSON.parse(json);
}

function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

// ------------------------------
// File I/O helpers
// ------------------------------
async function pickFile() {
  try {
    // @ts-ignore
    const [handle] = await (window).showOpenFilePicker({
      types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }],
    });
    await idbSet("fileHandle", handle);
    return handle;
  } catch (e) {
    // If user cancels open picker, allow creating a new file instead
    // @ts-ignore
    const handle = await (window).showSaveFilePicker({
      suggestedName: "portfolio.enc",
      types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }],
    });
    await idbSet("fileHandle", handle);
    return handle;
  }
}

async function getSavedFile() {
  const handle = await idbGet("fileHandle");
  return handle;
}

async function readPortfolioFile(handle, password) {
  const file = await handle.getFile();
  if (file.size === 0) return { version: 1, assetTypes: {}, allocation: {}, snapshots: [] };
  const buf = await file.arrayBuffer();
  return await decryptJson(buf, password);
}

async function writePortfolioFile(handle, password, data) {
  const payload = await encryptJson(data, password);
  const writable = await handle.createWritable();
  await writable.write(payload);
  await writable.close();
}

// ------------------------------
// Math / helpers
// ------------------------------
function netWorth(assets) {
  return (assets || []).reduce((acc, a) => acc + (Number(a.value) || 0), 0);
}

function currentByCategory(assets) {
  const map = {};
  for (const a of assets || []) {
    const key = a.type;
    map[key] = (map[key] || 0) + (Number(a.value) || 0);
  }
  return map;
}

function normalizeAllocation(alloc) {
  const total = Object.values(alloc).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const out = {};
  for (const k of Object.keys(alloc)) out[k] = (Number(alloc[k]) || 0) / total;
  return out; // fractions summing to ~1
}

function rebalanceWithNewCapital(assets, allocPct, newCapital) {
  const totalNow = netWorth(assets);
  const byCat = currentByCategory(assets);
  const norm = normalizeAllocation(allocPct);
  const cats = Array.from(new Set([...Object.keys(byCat), ...Object.keys(norm)]));

  const targetTotal = totalNow + (Number(newCapital) || 0);
  const idealByCat = {};
  for (const c of cats) idealByCat[c] = (norm[c] || 0) * targetTotal;

  const gaps = {};
  for (const c of cats) gaps[c] = Math.max(0, (idealByCat[c] || 0) - (byCat[c] || 0));

  const sumGaps = Object.values(gaps).reduce((a, b) => a + b, 0) || 1;
  const scaled = {};
  for (const c of cats) scaled[c] = (gaps[c] / sumGaps) * (Number(newCapital) || 0);

  return { totalNow, targetTotal, byCat, idealByCat, investPlan: scaled };
}

function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `${Math.round(n).toLocaleString()} €`;
  }
}

// ------------------------------
// Simple dark line chart (no deps)
// ------------------------------
function LineChart({ data }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const height = canvas.clientHeight * dpr;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const padding = 32 * dpr;
    ctx.strokeStyle = "#2a2a2a";
    ctx.lineWidth = 1;
    // axes
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    if (!data.length) {
      ctx.fillStyle = "#9aa0a6";
      ctx.font = `${14 * dpr}px ui-sans-serif`;
      ctx.fillText("No data", 12 * dpr, 20 * dpr);
      return;
    }

    const xs = data.map((_, i) => i);
    const ys = data.map((d) => d.value);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const xToPx = (x) => padding + (x / Math.max(1, xs.length - 1)) * (width - 2 * padding);
    const yToPx = (y) => height - padding - ((y - minY) / Math.max(1, maxY - minY)) * (height - 2 * padding);

    ctx.beginPath();
    for (let i = 0; i < xs.length; i++) {
      const x = xToPx(xs[i]);
      const y = yToPx(ys[i]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 2 * dpr;
    ctx.strokeStyle = "#8ab4f8";
    ctx.stroke();

    // last label
    const last = data[data.length - 1];
    const lx = xToPx(xs[xs.length - 1]);
    const ly = yToPx(ys[ys.length - 1]);
    ctx.fillStyle = "#e8eaed";
    ctx.font = `${12 * dpr}px ui-sans-serif`;
    ctx.fillText(`${last.label}: ${formatCurrency(last.value)}`, lx - 100 * dpr, ly - 8 * dpr);
  }, [data]);
  return <canvas ref={ref} className="w-full h-64 rounded border border-zinc-800 bg-zinc-900" />;
}

// ------------------------------
// UI bits
// ------------------------------
function Section({ title, children, right }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-zinc-200 font-medium">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, type = "text", placeholder = "", className = "", disabled = false }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}

function AddBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">
      {children}
    </button>
  );
}

function labelFor(key, types) {
  return types[key]?.label || key;
}

function mkId() { return Math.random().toString(36).slice(2); }

function mkAsset(type, registry) {
  const def = registry[type] || { fields: [] };
  const out = { id: mkId(), type, value: 0 };
  for (const f of def.fields) out[f.key] = f.default || "";
  return out;
}

function stripIds(a) { const { id, ...rest } = a; return rest; }

const defaultAssetTypes = {
  cash: { label: "Cash", fields: [{ key: "currency", label: "Currency", default: "EUR" }] },
  real_estate: { label: "Real estate", fields: [{ key: "description", label: "Description" }] },
  stock: { label: "Stock", fields: [{ key: "ticker", label: "Ticker" }] },
  private_company_share: { label: "Private company share", fields: [{ key: "company", label: "Company" }] },
};
function AssetList({ assets, setAssets, assetTypes }) {
  function update(id, patch) {
    setAssets(assets.map((a) => (a.id === id ? ({ ...a, ...patch }) : a)));
  }
  function remove(id) { setAssets(assets.filter(a => a.id !== id)); }

  function add(type) {
    setAssets([
      ...assets,
      mkAsset(type, assetTypes)
    ]);
  }

  function changeType(id, type) {
    setAssets(assets.map((a) => {
      if (a.id !== id) return a;
      const repl = mkAsset(type, assetTypes);
      return { ...repl, id: a.id, value: a.value };
    }));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {Object.entries(assetTypes).map(([k, def]) => (
          <AddBtn key={k} onClick={() => add(k)}>Add {def.label}</AddBtn>
        ))}
      </div>
      <div className="space-y-2">
        {assets.map((a) => {
          const def = assetTypes[a.type] || { fields: [] };
          return (
            <div key={a.id} className="grid md:grid-cols-12 gap-2 items-end bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
              <div className="md:col-span-2">
                <label className="text-xs text-zinc-400">Type</label>
                <select
                  className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                  value={a.type}
                  onChange={(e) => changeType(a.id, e.target.value)}
                >
                  {!assetTypes[a.type] && <option value={a.type}>{a.type}</option>}
                  {Object.entries(assetTypes).map(([k, d]) => (
                    <option key={k} value={k}>{d.label}</option>
                  ))}
                </select>
              </div>

              {def.fields.map((f) => (
                <TextInput
                  key={f.key}
                  className="md:col-span-3"
                  label={f.label}
                  value={a[f.key] || ""}
                  onChange={(v) => update(a.id, { [f.key]: v })}
                />
              ))}

              <TextInput className="md:col-span-3" label="Value" type="number" value={String(a.value)} onChange={(v) => update(a.id, { value: Number(v || 0) })} />

              <div className="md:col-span-1 flex justify-end">
                <button onClick={() => remove(a.id)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AssetTypeManager({ assetTypes, setAssetTypes }) {
  function updateLabel(k, label) {
    setAssetTypes({ ...assetTypes, [k]: { ...assetTypes[k], label } });
  }
  function updateFieldKey(typeKey, idx, value) {
    const t = assetTypes[typeKey];
    const fields = t.fields.map((f, i) => (i === idx ? { ...f, key: value } : f));
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }
  function updateFieldLabel(typeKey, idx, value) {
    const t = assetTypes[typeKey];
    const fields = t.fields.map((f, i) => (i === idx ? { ...f, label: value } : f));
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }
  function addType() {
    const key = window.prompt("New type key", "new_type");
    if (key && !assetTypes[key]) setAssetTypes({ ...assetTypes, [key]: { label: key, fields: [] } });
  }
  function removeType(key) {
    const { [key]: _discard, ...rest } = assetTypes;
    setAssetTypes(rest);
  }
  function addField(typeKey) {
    const key = window.prompt("Field key", "field");
    const label = window.prompt("Field label", "Field");
    if (key && label) {
      const t = assetTypes[typeKey];
      setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields: [...t.fields, { key, label }] } });
    }
  }
  function removeField(typeKey, idx) {
    const t = assetTypes[typeKey];
    const fields = t.fields.filter((_, i) => i !== idx);
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }

  return (
    <div className="space-y-4">
      {Object.entries(assetTypes).map(([k, def]) => (
        <div key={k} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
          <div className="flex items-end gap-2">
            <TextInput label="Type" value={k} onChange={() => {}} disabled className="md:col-span-3" />
            <TextInput label="Label" value={def.label} onChange={(v) => updateLabel(k, v)} className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Delete</button>
            </div>
          </div>
          {def.fields.map((f, i) => (
            <div key={i} className="flex items-end gap-2">
              <TextInput label="Field key" value={f.key} onChange={(v) => updateFieldKey(k, i, v)} />
              <TextInput label="Field label" value={f.label} onChange={(v) => updateFieldLabel(k, i, v)} />
              <button onClick={() => removeField(k, i)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
            </div>
          ))}
          <button onClick={() => addField(k)} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">Add field</button>
        </div>
      ))}
      <AddBtn onClick={addType}>Add type</AddBtn>
    </div>
  );
}

function AllocationEditor({ allocation, setAllocation, assetTypes }) {
  const keys = Array.from(new Set([...Object.keys(assetTypes), ...Object.keys(allocation || {})]));
  const total = Object.values(allocation || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  function setKey(k, v) { setAllocation({ ...allocation, [k]: v }); }
  function remove(k) { const { [k]: _discard, ...rest } = allocation; setAllocation(rest); }
  function add() { const name = window.prompt("New category key (slug)", "other"); if (name) setAllocation({ ...allocation, [name]: 0 }); }

  return (
    <div className="space-y-2">
      {keys.map((k) => (
        <div key={k} className="grid grid-cols-12 items-end gap-2">
          <div className="col-span-6 text-zinc-300">{labelFor(k, assetTypes)}</div>
          <div className="col-span-4">
            <TextInput label="Target %" type="number" value={String(allocation[k] ?? 0)} onChange={(v) => setKey(k, Number(v || 0))} />
          </div>
          <div className="col-span-2 flex justify-end">
            <button onClick={() => remove(k)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between mt-2">
        <button onClick={add} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">Add category</button>
        <div className={`text-sm ${total === 100 ? "text-emerald-400" : "text-amber-400"}`}>Total: {total}% {total !== 100 && "(will be normalized)"}</div>
      </div>
    </div>
  );
}

function RebalancePlan({ data, assetTypes }) {
  const cats = Object.keys(data.investPlan || {}).sort();
  if (cats.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="text-sm text-zinc-400 mb-2">Now: <b className="text-zinc-200">{formatCurrency(data.totalNow)}</b> → Target: <b className="text-zinc-200">{formatCurrency(data.targetTotal)}</b></div>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left py-1">Category</th>
            <th className="text-right py-1">Current</th>
            <th className="text-right py-1">Ideal</th>
            <th className="text-right py-1">Invest now</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c} className="border-t border-zinc-800">
              <td className="py-1 text-zinc-200">{labelFor(c, assetTypes)}</td>
              <td className="py-1 text-right text-zinc-300">{formatCurrency(data.byCat[c] || 0)}</td>
              <td className="py-1 text-right text-zinc-300">{formatCurrency(data.idealByCat[c] || 0)}</td>
              <td className="py-1 text-right font-medium text-zinc-100">{formatCurrency(data.investPlan[c] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ConfigPage({ assetTypes, setAssetTypes, allocation, setAllocation }) {
  return (
    <div className="space-y-6">
      <Section title="Asset Types">
        <AssetTypeManager assetTypes={assetTypes} setAssetTypes={setAssetTypes} />
      </Section>
      <Section title="Allocation">
        <AllocationEditor allocation={allocation} setAllocation={setAllocation} assetTypes={assetTypes} />
      </Section>
    </div>
  );
}

function buildSeries(snaps, period) {
  const pts = (snaps || []).map((s) => ({ date: new Date(s.asOf), value: netWorth(s.assets || []) }));
  const grouped = groupByPeriod(pts, period);
  return grouped;
}

function groupByPeriod(points, mode) {
  const fmt = (d) => (mode === "monthly" ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` : `${d.getFullYear()}`);
  const map = new Map();
  for (const p of points || []) {
    const key = fmt(p.date);
    const prev = map.get(key);
    if (!prev || p.date.getTime() > prev.lastDate) map.set(key, { label: key, value: p.value, lastDate: p.date.getTime() });
  }
  return Array.from(map.values()).sort((a, b) => a.lastDate - b.lastDate);
}

// ------------------------------
// Main App
// ------------------------------
export default function App() {
  const [password, setPassword] = useState("");
  const [fileHandle, setFileHandle] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [assetTypes, setAssetTypes] = useState(defaultAssetTypes);
  const [assets, setAssets] = useState([
    mkAsset("cash", defaultAssetTypes),
    mkAsset("real_estate", defaultAssetTypes),
    mkAsset("stock", defaultAssetTypes),
  ]);
  const [allocation, setAllocation] = useState({ cash: 20, real_estate: 50, stock: 30 });
  const [newCapital, setNewCapital] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [page, setPage] = useState("main");

  useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedFile();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") setFileHandle(saved);
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);

  const totalNow = useMemo(() => netWorth(assets), [assets]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalance = useMemo(() => rebalanceWithNewCapital(assets, allocation, newCapital || 0), [assets, allocation, newCapital]);

  async function handlePickFile() {
    try {
      const h = await pickFile();
      setFileHandle(h);
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }

  async function handleLoad() {
    if (!fileHandle || !password) return setError("Pick a file and enter password first.");
    setLoading(true); setError(null);
    try {
      const data = await readPortfolioFile(fileHandle, password);
      const snaps = data.snapshots || [];
      setSnapshots(snaps);
      const latest = snaps[snaps.length - 1];
      if (latest) {
        setAssets((latest.assets || []).map((a) => ({ ...a, id: mkId() })));
      }
      setAllocation(data.allocation || {});
      setAssetTypes(data.assetTypes || defaultAssetTypes);
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally { setLoading(false); }
  }

  async function handleSaveNew() {
    if (!fileHandle || !password) return setError("Pick a file and enter password first.");
    setLoading(true); setError(null);
    try {
      const snap = { asOf, assets: assets.map(stripIds) };
      const nextSnapshots = [...snapshots, snap];
      const data = { version: 1, assetTypes, allocation, snapshots: nextSnapshots };
      await writePortfolioFile(fileHandle, password, data);
      setSnapshots(nextSnapshots);
      alert("Saved snapshot");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Local‑First Portfolio Tracker</h1>
            <p className="text-sm text-zinc-400">Private by default · Encrypted portfolio file on your disk</p>
          </div>
          <div className="flex items-end gap-2">
            <TextInput label="Password" type="password" value={password} onChange={setPassword} className="w-56" />
            <button onClick={handlePickFile} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">{fileHandle ? "Change File" : "Choose File"}</button>
            <button onClick={handleLoad} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Load</button>
            <button onClick={handleSaveNew} className="h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-500">Save snapshot</button>
            <button onClick={() => setPage(page === "main" ? "config" : "main")} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">{page === "main" ? "Config" : "Back"}</button>
          </div>
        </header>

        {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
        {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}
        {page === "main" ? (
          <>
            <div className="grid md:grid-cols-3 gap-6">
              <Section title="As of date">
                <TextInput label="Date" type="date" value={asOf} onChange={setAsOf} />
              </Section>

              <Section title="Net worth (current)">
                <div className="text-3xl font-semibold">{formatCurrency(totalNow)}</div>
                <div className="text-xs text-zinc-400 mt-1">Computed from asset list</div>
              </Section>

              <Section title="History view" right={
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm">
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              }>
                <LineChart data={series} />
              </Section>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Section title="Assets">
                <AssetList assets={assets} setAssets={setAssets} assetTypes={assetTypes} />
              </Section>

              <Section title="Rebalance">
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="New capital to invest" type="number" value={String(newCapital)} onChange={(v) => setNewCapital(Number(v || 0))} />
                  <div className="text-sm text-zinc-400 flex items-end">Distribute this to move toward target without selling.</div>
                </div>
                <RebalancePlan data={rebalance} assetTypes={assetTypes} />
              </Section>
            </div>

            <Section title="Loaded snapshots">
              {snapshots.length === 0 ? (
                <div className="text-zinc-400 text-sm">None yet. Create your first snapshot above.</div>
              ) : (
                <ul className="text-sm max-h-48 overflow-auto space-y-1">
                  {snapshots.map((s, i) => (
                    <li key={i} className="text-zinc-300">
                      {new Date(s.asOf).toISOString().slice(0, 10)} — {formatCurrency(netWorth(s.assets || []))}
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </>
        ) : (
          <ConfigPage assetTypes={assetTypes} setAssetTypes={setAssetTypes} allocation={allocation} setAllocation={setAllocation} />
        )}
      </div>
    </div>
  );
}
