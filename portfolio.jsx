import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Local‑First Portfolio Tracker — Dark Mode, Form UI (single‑file React component)
 * - Dark theme UI (Tailwind classes)
 * - Form-based asset editing (no JSON), add/remove items per type
 * - Allocation editor with % targets
 * - Rebalance helper: enter "new capital" and get invest suggestions (no selling assumed)
 * - Historical snapshots: each save writes a new encrypted file in the chosen folder
 * - Net-worth chart (monthly/yearly)
 * - Encryption: AES‑GCM 256 with PBKDF2 (SHA‑256)
 *
 * Best in Chromium browsers (Chrome/Edge/Opera) with File System Access API.
 */

// ------------------------------
// Minimal IndexedDB helpers to persist the directory handle
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
async function pickDirectory() {
  // @ts-ignore
  const dir = await (window).showDirectoryPicker();
  await idbSet("dirHandle", dir);
  return dir;
}

async function getSavedDirectory() {
  const handle = await idbGet("dirHandle");
  return handle;
}

function formatUtcTimestamp(d = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "-" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds())
  );
}

function isEncName(name) {
  return /^portfolio-\d{8}-\d{6}\.enc$/.test(name);
}

async function readAllSnapshots(dir, password) {
  const out = [];
  // @ts-ignore for-await entries()
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind === "file" && isEncName(name)) {
      const file = await handle.getFile();
      try {
        const snap = await decryptJson(await file.arrayBuffer(), password);
        if (snap && snap.asOf && snap.assets) out.push(snap);
      } catch (e) {
        console.warn("Decrypt failed", name, e);
      }
    }
  }
  out.sort((a, b) => new Date(a.asOf).getTime() - new Date(b.asOf).getTime());
  return out;
}

async function writeSnapshot(dir, password, snapshot) {
  const ts = formatUtcTimestamp(new Date());
  const name = `portfolio-${ts}.enc`;
  const fileHandle = await dir.getFileHandle(name, { create: true });
  const payload = await encryptJson(snapshot, password);
  const writable = await fileHandle.createWritable();
  await writable.write(payload);
  await writable.close();
  return name;
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

function TextInput({ label, value, onChange, type = "text", placeholder = "", className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
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

function labelFor(key) {
  const map = {
    cash: "Cash",
    real_estate: "Real estate",
    stocks: "Stocks",
    private_company_share: "Private company share",
  };
  return map[key] || key;
}

function mkId() { return Math.random().toString(36).slice(2); }
function mkCash() { return { id: mkId(), type: "cash", currency: "EUR", value: 0 }; }
function mkRE() { return { id: mkId(), type: "real_estate", description: "", value: 0 }; }
function mkStock() { return { id: mkId(), type: "stock", ticker: "", value: 0 }; }
function mkPriv() { return { id: mkId(), type: "private_company_share", company: "", value: 0 }; }
function stripIds(a) { const { id, ...rest } = a; return rest; }

function AssetList({ assets, setAssets }) {
  function update(id, patch) {
    setAssets(assets.map((a) => (a.id === id ? ({ ...a, ...patch }) : a)));
  }
  function remove(id) { setAssets(assets.filter(a => a.id !== id)); }

  function add(type) {
    setAssets([
      ...assets,
      type === "cash" ? mkCash() : type === "real_estate" ? mkRE() : type === "stock" ? mkStock() : mkPriv()
    ]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <AddBtn onClick={() => add("cash")}>Add Cash</AddBtn>
        <AddBtn onClick={() => add("real_estate")}>Add Real Estate</AddBtn>
        <AddBtn onClick={() => add("stock")}>Add Stock</AddBtn>
        <AddBtn onClick={() => add("private_company_share")}>Add Private Co. Share</AddBtn>
      </div>
      <div className="space-y-2">
        {assets.map((a) => (
          <div key={a.id} className="grid md:grid-cols-12 gap-2 items-end bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
            <div className="md:col-span-2">
              <label className="text-xs text-zinc-400">Type</label>
              <select
                className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
                value={a.type}
                onChange={(e) => update(a.id, { type: e.target.value })}
              >
                <option value="cash">Cash</option>
                <option value="real_estate">Real estate</option>
                <option value="stock">Stock</option>
                <option value="private_company_share">Private company share</option>
              </select>
            </div>

            {a.type === "cash" && (
              <TextInput className="md:col-span-3" label="Currency" value={a.currency} onChange={(v) => update(a.id, { currency: v })} />
            )}
            {a.type === "real_estate" && (
              <TextInput className="md:col-span-5" label="Description" value={a.description} onChange={(v) => update(a.id, { description: v })} />
            )}
            {a.type === "stock" && (
              <TextInput className="md:col-span-3" label="Ticker" value={a.ticker} onChange={(v) => update(a.id, { ticker: v })} />
            )}
            {a.type === "private_company_share" && (
              <TextInput className="md:col-span-4" label="Company" value={a.company} onChange={(v) => update(a.id, { company: v })} />
            )}

            <TextInput className="md:col-span-3" label="Value" type="number" value={String(a.value)} onChange={(v) => update(a.id, { value: Number(v || 0) })} />

            <div className="md:col-span-1 flex justify-end">
              <button onClick={() => remove(a.id)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AllocationEditor({ allocation, setAllocation }) {
  const keys = Array.from(new Set(["cash", "real_estate", "stocks", "private_company_share", ...Object.keys(allocation || {})]));
  const total = Object.values(allocation || {}).reduce((a, b) => a + (Number(b) || 0), 0);
  function setKey(k, v) { setAllocation({ ...allocation, [k]: v }); }
  function remove(k) { const { [k]: _discard, ...rest } = allocation; setAllocation(rest); }
  function add() { const name = window.prompt("New category key (slug)", "other"); if (name) setAllocation({ ...allocation, [name]: 0 }); }

  return (
    <div className="space-y-2">
      {keys.map((k) => (
        <div key={k} className="grid grid-cols-12 items-end gap-2">
          <div className="col-span-6 text-zinc-300">{labelFor(k)}</div>
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

function RebalancePlan({ data }) {
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
              <td className="py-1 text-zinc-200">{labelFor(c)}</td>
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
  const [dir, setDir] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [asOf, setAsOf] = useState(() => new Date().toISOString().slice(0, 10));
  const [assets, setAssets] = useState([mkCash(), mkRE(), mkStock()]);
  const [allocation, setAllocation] = useState({ cash: 20, real_estate: 50, stocks: 30 });
  const [newCapital, setNewCapital] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedDirectory();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") setDir(saved);
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);

  const totalNow = useMemo(() => netWorth(assets), [assets]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalance = useMemo(() => rebalanceWithNewCapital(assets, allocation, newCapital || 0), [assets, allocation, newCapital]);

  async function handlePickDir() {
    try {
      const d = await pickDirectory();
      setDir(d);
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }

  async function handleLoad() {
    if (!dir || !password) return setError("Pick a folder and enter password first.");
    setLoading(true); setError(null);
    try {
      const snaps = await readAllSnapshots(dir, password);
      setSnapshots(snaps);
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally { setLoading(false); }
  }

  async function handleSaveNew() {
    if (!dir || !password) return setError("Pick a folder and enter password first.");
    setLoading(true); setError(null);
    try {
      const snap = { asOf, assets: assets.map(stripIds), allocation };
      const name = await writeSnapshot(dir, password, snap);
      const snaps = await readAllSnapshots(dir, password);
      setSnapshots(snaps);
      alert(`Saved ${name}`);
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
            <p className="text-sm text-zinc-400">Private by default · Encrypted snapshots on your disk</p>
          </div>
          <div className="flex items-end gap-2">
            <TextInput label="Password" type="password" value={password} onChange={setPassword} className="w-56" />
            <button onClick={handlePickDir} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">{dir ? "Change Folder" : "Choose Folder"}</button>
            <button onClick={handleLoad} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Load</button>
            <button onClick={handleSaveNew} className="h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-500">Save snapshot</button>
          </div>
        </header>

        {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
        {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}

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
            <AssetList assets={assets} setAssets={setAssets} />
          </Section>

          <Section title="Allocation & Rebalance">
            <AllocationEditor allocation={allocation} setAllocation={setAllocation} />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <TextInput label="New capital to invest" type="number" value={String(newCapital)} onChange={(v) => setNewCapital(Number(v || 0))} />
              <div className="text-sm text-zinc-400 flex items-end">Distribute this to move toward target without selling.</div>
            </div>
            <RebalancePlan data={rebalance} />
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
      </div>
    </div>
  );
}
