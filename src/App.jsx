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
  const rebalance = useMemo(
    () => rebalanceWithNewCapital(assets, allocation, newCapital || 0),
    [assets, allocation, newCapital]
  );

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
