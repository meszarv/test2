import React, { useEffect, useMemo, useState } from "react";
import Section from "./components/Section.jsx";
import TextInput from "./components/TextInput.jsx";
import LineChart from "./components/LineChart.jsx";
import AssetList from "./components/AssetList.jsx";
import RebalancePlan from "./components/RebalancePlan.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import { mkAsset, stripIds, formatCurrency, mkId } from "./utils.js";
import { defaultAssetTypes, netWorth, rebalanceWithNewCapital, buildSeries } from "./data.js";
import { pickFile, getSavedFile, readPortfolioFile, writePortfolioFile } from "./file.js";

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
  const [step, setStep] = useState("pick");
  const [configOpen, setConfigOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedFile();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") {
            setFileHandle(saved);
            setStep("password");
          }
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);

  const totalNow = useMemo(() => netWorth(assets), [assets]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalance = useMemo(
    () => rebalanceWithNewCapital(assets, allocation, newCapital || 0),
    [assets, allocation, newCapital]
  );

  async function handlePickFile() {
    try {
      const h = await pickFile();
      setFileHandle(h);
      setStep("password");
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
      setStep("main");
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

  async function handleCloseFile() {
    if (!fileHandle) return;
    setLoading(true); setError(null);
    try {
      const data = { version: 1, assetTypes, allocation, snapshots };
      await writePortfolioFile(fileHandle, password, data);
      setFileHandle(null);
      setPassword("");
      setSnapshots([]);
      setAssets([
        mkAsset("cash", defaultAssetTypes),
        mkAsset("real_estate", defaultAssetTypes),
        mkAsset("stock", defaultAssetTypes),
      ]);
      setAllocation({ cash: 20, real_estate: 50, stock: 30 });
      setAsOf(new Date().toISOString().slice(0, 10));
      setStep("pick");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {step === "pick" && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <button onClick={handlePickFile} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Select or create file</button>
        </div>
      )}
      {step === "password" && (
        <div className="max-w-md mx-auto p-6 space-y-4">
          <TextInput label="Password" type="password" value={password} onChange={setPassword} className="w-full" />
          <div className="flex justify-end">
            <button onClick={handleLoad} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Open</button>
          </div>
        </div>
      )}
      {step === "main" && (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Local‑First Portfolio Tracker</h1>
              <p className="text-sm text-zinc-400">Private by default · Encrypted portfolio file on your disk</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfigOpen(true)} className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl">⚙</button>
              <button onClick={handleCloseFile} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Close</button>
            </div>
          </header>

          {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
          {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}

          <div className="flex justify-end">
            <button onClick={handleSaveNew} className="h-10 px-3 rounded-lg bg-blue-600 hover:bg-blue-500">Save snapshot</button>
          </div>

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
        </div>
      )}

      {configOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-3xl w-full max-h-full overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuration</h2>
              <button onClick={() => setConfigOpen(false)} className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Close</button>
            </div>
            <ConfigPage assetTypes={assetTypes} setAssetTypes={setAssetTypes} allocation={allocation} setAllocation={setAllocation} />
          </div>
        </div>
      )}
    </div>
  );
}
