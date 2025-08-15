import React, { useEffect, useMemo, useState } from "react";
import Section from "./components/Section.jsx";
import TextInput from "./components/TextInput.jsx";
import LineChart from "./components/LineChart.jsx";
import PieChart from "./components/PieChart.jsx";
import AssetTable from "./components/AssetTable.jsx";
import AddAssetModal from "./components/AddAssetModal.jsx";
import EditAssetModal from "./components/EditAssetModal.jsx";
import SnapshotTabs from "./components/SnapshotTabs.jsx";
import RebalancePlan from "./components/RebalancePlan.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import { mkAsset, formatCurrency } from "./utils.js";
import { defaultAssetTypes, netWorth, rebalance, buildSeries, currentByCategory } from "./data.js";
import useSnapshots from "./hooks/useSnapshots.js";
import usePortfolioFile from "./hooks/usePortfolioFile.js";
import pkg from "../package.json";

export default function App() {
  const [assetTypes, setAssetTypes] = useState(defaultAssetTypes);
  const [assets, setAssets] = useState([]);
  const [allocation, setAllocation] = useState({});
  const [period, setPeriod] = useState("monthly");
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);

  const {
    snapshots,
    setSnapshots,
    currentIndex,
    setCurrentIndex,
    snapshotFromAssets,
    setAssetsAndUpdateSnapshot,
    handleSelectSnapshot,
    handleAddSnapshot,
    handleChangeSnapshotDate,
    handleDeleteSnapshot,
  } = useSnapshots({ assets, setAssets, assetTypes });

  const {
    password,
    setPassword,
    fileHandle,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    setDirty,
    skipDirty,
    handleOpenExisting,
    handleCreateNew,
    handleLoad,
    handleSave,
    handleCloseFile,
  } = usePortfolioFile({
    assets,
    setAssets,
    assetTypes,
    setAssetTypes,
    allocation,
    setAllocation,
    snapshots,
    setSnapshots,
    snapshotFromAssets,
    setCurrentIndex,
  });

  useEffect(() => {
    snapshotFromAssets(assets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalNow = useMemo(() => netWorth(assets), [assets]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalancePlanData = useMemo(() => rebalance(assets, allocation), [assets, allocation]);
  const prevAssets = useMemo(() => (currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : []), [snapshots, currentIndex]);
  const currentAllocation = useMemo(() => currentByCategory(assets), [assets]);

  function handleAddAsset({ name, type, description, value }) {
    const asset = mkAsset(type, assetTypes, name);
    asset.description = description;
    asset.value = value;
    setAssetsAndUpdateSnapshot([...assets, asset]);
  }

  function handleEditAsset(updated) {
    setAssetsAndUpdateSnapshot(
      assets.map((a) => (a.id === updated.id ? updated : a))
    );
  }

  function handleDeleteAsset(a) {
    if (confirm("Remove asset?")) {
      setAssetsAndUpdateSnapshot(assets.filter((x) => x.id !== a.id));
      setEditAsset(null);
    }
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
        <form onSubmit={(e) => { e.preventDefault(); handleLoad(); }} className="max-w-md mx-auto p-6 space-y-4">
          {error && <div className="text-red-400">{error}</div>}
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            className="w-full"
            autoFocus
          />
          <div className="flex justify-between">
            <button type="button" onClick={() => { setFileHandle(null); setPassword(""); setError(null); setStep("pick"); }} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Cancel</button>
            <button type="submit" className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Open</button>
          </div>
        </form>
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
              <button
                onClick={handleSave}
                title="Save"
                className={`h-10 w-10 rounded-lg border flex items-center justify-center text-xl ${dirty ? "bg-blue-600 hover:bg-blue-500 border-blue-500" : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"}`}
              >
                💾
              </button>
              {dirty && <span className="text-amber-400" title="Unsaved changes">●</span>}
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
                <PieChart data={currentAllocation} />
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
                onDelete={handleDeleteSnapshot}
              />
              <AssetTable
                assets={assets}
                prevAssets={prevAssets}
                setAssets={setAssetsAndUpdateSnapshot}
                assetTypes={assetTypes}
                onEdit={(a) => setEditAsset(a)}
              />
            </Section>

        </div>
        <footer className="text-center text-xs text-zinc-500 mt-12">v{pkg.version}</footer>
        <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} assetTypes={assetTypes} onAdd={handleAddAsset} />
        <EditAssetModal
          open={!!editAsset}
          asset={editAsset}
          onClose={() => setEditAsset(null)}
          assetTypes={assetTypes}
          onSave={handleEditAsset}
          onDelete={handleDeleteAsset}
        />
        {currentIndex === snapshots.length - 1 && (
          <button
            onClick={() => setAddOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-3xl leading-none shadow-lg"
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
