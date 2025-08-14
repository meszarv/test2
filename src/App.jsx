import React, { useEffect, useMemo, useState } from "react";
import Section from "./components/Section.jsx";
import TextInput from "./components/TextInput.jsx";
import LineChart from "./components/LineChart.jsx";
import AssetTable from "./components/AssetTable.jsx";
import AddAssetModal from "./components/AddAssetModal.jsx";
import SnapshotTabs from "./components/SnapshotTabs.jsx";
import RebalancePlan from "./components/RebalancePlan.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import { mkAsset, stripIds, formatCurrency, mkId, labelFor } from "./utils.js";
import { defaultAssetTypes, netWorth, rebalance, buildSeries } from "./data.js";
import { openExistingFile, createNewFile, getSavedFile, readPortfolioFile, writePortfolioFile } from "./file.js";

export default function App() {
  const [password, setPassword] = useState("");
  const [fileHandle, setFileHandle] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assetTypes, setAssetTypes] = useState(defaultAssetTypes);
  const [assets, setAssets] = useState([
    mkAsset("cash", defaultAssetTypes, "Cash"),
    mkAsset("real_estate", defaultAssetTypes, "Real estate"),
    mkAsset("stock", defaultAssetTypes, "Stock"),
  ]);
  const [allocation, setAllocation] = useState({ cash: 20, real_estate: 50, stock: 30 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [step, setStep] = useState("pick");
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

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

  useEffect(() => {
    snapshotFromAssets(assets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalNow = useMemo(() => netWorth(assets), [assets]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalancePlanData = useMemo(() => rebalance(assets, allocation), [assets, allocation]);
  const prevAssets = useMemo(() => (currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : []), [snapshots, currentIndex]);

  function snapshotFromAssets(nextAssets, date = new Date()) {
    setSnapshots((prev) => {
      const snap = { asOf: date.toISOString(), assets: nextAssets.map(stripIds) };
      const s = [...prev, snap].sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setCurrentIndex(s.indexOf(snap));
      return s;
    });
  }

  function setAssetsAndSnapshot(next) {
    setAssets(next);
    snapshotFromAssets(next);
  }

  function handleSelectSnapshot(i) {
    const snap = snapshots[i];
    if (!snap) return;
    setCurrentIndex(i);
    setAssets((snap.assets || []).map((a) => ({ ...a, id: mkId(), name: a.name || labelFor(a.type, assetTypes) })));
  }

  function handleAddAsset({ name, type, value, ...fields }) {
    const asset = mkAsset(type, assetTypes, name);
    asset.value = value;
    Object.assign(asset, fields);
    setAssetsAndSnapshot([...assets, asset]);
  }

  function handleAddSnapshot() {
    snapshotFromAssets(assets);
  }

  function handleChangeSnapshotDate(i, date) {
    setSnapshots((prev) => {
      const updated = { ...prev[i], asOf: date.toISOString() };
      const next = prev.map((s, idx) => (idx === i ? updated : s));
      const sorted = next.slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setCurrentIndex(sorted.indexOf(updated));
      return sorted;
    });
  }

  async function handleOpenExisting() {
    try {
      const h = await openExistingFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }

  async function handleCreateNew() {
    try {
      const h = await createNewFile();
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
      const file = await fileHandle.getFile();
      const isEmpty = file.size === 0;
      const data = await readPortfolioFile(fileHandle, password);
      if (isEmpty) {
        await writePortfolioFile(fileHandle, password, data);
      }
      const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setSnapshots(snaps);
      const latest = snaps[snaps.length - 1];
      if (latest) {
        setAssets((latest.assets || []).map((a) => ({ ...a, id: mkId(), name: a.name || labelFor(a.type, assetTypes) })));
        setCurrentIndex(snaps.length - 1);
      } else {
        snapshotFromAssets(assets);
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
      const data = { version: 1, assetTypes, allocation, snapshots };
      await writePortfolioFile(fileHandle, password, data);
      alert("Saved file");
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
      setCurrentIndex(0);
      const initialAssets = [
        mkAsset("cash", defaultAssetTypes, "Cash"),
        mkAsset("real_estate", defaultAssetTypes, "Real estate"),
        mkAsset("stock", defaultAssetTypes, "Stock"),
      ];
      setAssets(initialAssets);
      snapshotFromAssets(initialAssets);
      setAllocation({ cash: 20, real_estate: 50, stock: 30 });
      setStep("pick");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {step === "pick" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
          <button onClick={handleOpenExisting} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Open existing file</button>
          <button onClick={handleCreateNew} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Create new file</button>
          <a href="/sample-portfolio.enc" download className="text-sm text-blue-400 underline">Download sample file</a>
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
        <>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Local‑First Portfolio Tracker</h1>
              <p className="text-sm text-zinc-400">Private by default · Encrypted portfolio file on your disk</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setConfigOpen(true)} className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl">⚙</button>
              <button onClick={handleCloseFile} title="Close" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl">✖</button>
            </div>
          </header>

          {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
          {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}

            <div className="grid md:grid-cols-3 gap-6">
              <Section title="Net worth (current)">
                <div className="text-3xl font-semibold">{formatCurrency(totalNow)}</div>
                <div className="text-xs text-zinc-400 mt-1">Computed from asset list</div>
              </Section>

              <Section title="Rebalance">
                <div className="text-sm text-zinc-400 mb-2">Cash above target allocation is distributed to under-allocated categories.</div>
                <RebalancePlan data={rebalancePlanData} assetTypes={assetTypes} />
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

            <Section title="Assets">
              <SnapshotTabs
                snapshots={snapshots}
                currentIndex={currentIndex}
                onSelect={handleSelectSnapshot}
                onAdd={handleAddSnapshot}
                onChangeDate={handleChangeSnapshotDate}
              />
              <AssetTable
                assets={assets}
                prevAssets={prevAssets}
                setAssets={setAssetsAndSnapshot}
                assetTypes={assetTypes}
                readOnly={currentIndex !== snapshots.length - 1}
              />
            </Section>

        </div>
        <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} assetTypes={assetTypes} onAdd={handleAddAsset} />
        {currentIndex === snapshots.length - 1 && (
          <button
            onClick={() => setAddOpen(true)}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-3xl leading-none"
          >
            +
          </button>
        )}
        </>
      )}

      {configOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-3xl w-full max-h-full overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuration</h2>
              <button onClick={() => setConfigOpen(false)} title="Close" className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center">✖</button>
            </div>
            <ConfigPage assetTypes={assetTypes} setAssetTypes={setAssetTypes} allocation={allocation} setAllocation={setAllocation} assets={assets} />
          </div>
        </div>
      )}
    </div>
  );
}
