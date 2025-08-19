import React, { useEffect, useMemo, useState } from "react";
import Section from "./components/Section.jsx";
import TextInput from "./components/TextInput.jsx";
import LineChart from "./components/LineChart.jsx";
import StackedAreaChart from "./components/StackedAreaChart.jsx";
import PieChart from "./components/PieChart.jsx";
import AssetTable from "./components/AssetTable.jsx";
import LiabilityTable from "./components/LiabilityTable.jsx";
import AddAssetModal from "./components/AddAssetModal.jsx";
import AddLiabilityModal from "./components/AddLiabilityModal.jsx";
import EditAssetModal from "./components/EditAssetModal.jsx";
import EditLiabilityModal from "./components/EditLiabilityModal.jsx";
import SnapshotTabs from "./components/SnapshotTabs.jsx";
import RebalancePlan from "./components/RebalancePlan.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import AddBtn from "./components/AddBtn.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import { formatCurrency } from "./utils.js";
import {
  defaultAssetTypes,
  defaultLiabilityTypes,
  netWorth,
  rebalance,
  buildSeries,
  currentByCategory,
} from "./data.js";
import useSnapshots from "./hooks/useSnapshots.js";
import usePortfolioFile from "./hooks/usePortfolioFile.js";
import useAssetManager from "./hooks/useAssetManager.js";
import useLiabilityManager from "./hooks/useLiabilityManager.js";
import pkg from "../package.json";
import { initDrive } from "./drive.js";

export default function App() {
  const [assetTypes, setAssetTypes] = useState(defaultAssetTypes);
  const [liabilityTypes, setLiabilityTypes] = useState(defaultLiabilityTypes);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [allocation, setAllocation] = useState({});
  const [period, setPeriod] = useState("monthly");
  const [chartMode, setChartMode] = useState("total");
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addLiabilityOpen, setAddLiabilityOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editLiability, setEditLiability] = useState(null);
  const [showTarget, setShowTarget] = useState(false);
  const driveApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const driveClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const driveReady = driveApiKey && driveClientId;
  const builtAgo = useMemo(() => {
    const ts = import.meta.env.VITE_BUILD_TIME;
    if (!ts) return null;
    const diff = Date.now() - new Date(ts).getTime();
    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return rtf.format(-days, 'day');
    if (hours > 0) return rtf.format(-hours, 'hour');
    if (minutes > 0) return rtf.format(-minutes, 'minute');
    return rtf.format(-seconds, 'second');
  }, []);

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
  } = useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes });

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
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleCloseFile,
  } = usePortfolioFile({
    assets,
    setAssets,
    liabilities,
    setLiabilities,
    assetTypes,
    setAssetTypes,
    liabilityTypes,
    setLiabilityTypes,
    allocation,
    setAllocation,
    snapshots,
    setSnapshots,
    snapshotFromAssets,
    setCurrentIndex,
  });

  const {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset,
  } = useAssetManager({
    assets,
    assetTypes,
    setAssetsAndUpdateSnapshot,
    setEditAsset,
  });

  const {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
  } = useLiabilityManager({
    assets,
    liabilities,
    liabilityTypes,
    setAssetsAndUpdateSnapshot,
    setEditLiability,
  });

  useEffect(() => {
    snapshotFromAssets(assets, liabilities);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (driveReady) {
      initDrive({ apiKey: driveApiKey, clientId: driveClientId });
    }
  }, [driveReady, driveApiKey, driveClientId]);

  const totalNow = useMemo(() => netWorth(assets, liabilities), [assets, liabilities]);
  const series = useMemo(() => buildSeries(snapshots, period), [snapshots, period]);
  const rebalancePlanData = useMemo(
    () => rebalance(assets, liabilities, allocation),
    [assets, liabilities, allocation]
  );
  const prevAssets = useMemo(() => (currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : []), [snapshots, currentIndex]);
  const prevLiabilities = useMemo(
    () => (currentIndex > 0 ? snapshots[currentIndex - 1]?.liabilities || [] : []),
    [snapshots, currentIndex]
  );
  const currentAllocation = useMemo(() => currentByCategory(assets, liabilities), [assets, liabilities]);

  // Asset and liability management handled via custom hooks


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {step === "pick" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
          <button onClick={handleOpenExisting} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Open existing file</button>
          <button onClick={handleCreateNew} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Create new file</button>
          {driveReady && (
            <button onClick={handleOpenDrive} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Open from Google Drive</button>
          )}
          <button onClick={handleOpenSample} className="text-sm text-blue-400 underline">Open sample portfolio</button>
          {builtAgo && (
            <div className="text-sm text-zinc-400">Built {builtAgo}</div>
          )}
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

            <div className="grid md:grid-cols-2 gap-6">
              <Section
                title="Net worth (current)"
                right={
                  <button
                    onMouseDown={() => setShowTarget(true)}
                    onMouseUp={() => setShowTarget(false)}
                    onMouseLeave={() => setShowTarget(false)}
                    className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs"
                    title="Show target while held"
                  >
                    Target
                  </button>
                }
              >
                <div className="text-3xl font-semibold">{formatCurrency(totalNow)}</div>
                <div className="text-xs text-zinc-400 mt-1">Computed from asset list</div>
                <PieChart
                  data={currentAllocation}
                  targetData={rebalancePlanData.idealByCat}
                  showTarget={showTarget}
                  assetTypes={assetTypes}
                />
              </Section>
              <Section
                title="History view"
                right={
                  <div className="flex items-center gap-2">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                      <div className="flex rounded-lg overflow-hidden border border-zinc-700 text-sm">
                        <button
                          onClick={() => setChartMode("total")}
                          className={`px-2 py-1 ${chartMode === "total" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                        >
                          Net worth
                        </button>
                        <button
                          onClick={() => setChartMode("category")}
                          className={`px-2 py-1 ${chartMode === "category" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}
                        >
                          By category
                        </button>
                      </div>
                    </div>
                  }
                >
                  {chartMode === "total" ? (
                    <LineChart
                      data={series}
                      showGridlines={series.length > 2}
                      showMarkers={series.length > 2}
                      showVerticalGridlines={period === "monthly"}
                    />
                  ) : (
                    <StackedAreaChart data={series} assetTypes={assetTypes} />
                  )}
                </Section>
              </div>

            <Section title="Rebalance">
              <div className="text-sm text-zinc-400 mb-2">
                Cash above target allocation is distributed to under-allocated categories.
              </div>
              <RebalancePlan data={rebalancePlanData} assetTypes={assetTypes} />
            </Section>

            <Section
              title="Assets"
              right={
                currentIndex === snapshots.length - 1 ? (
                  <AddBtn onClick={() => setAddOpen(true)} title="Add asset" />
                ) : null
              }
            >
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

            <Section
              title="Liabilities"
              right={
                currentIndex === snapshots.length - 1 ? (
                  <AddBtn onClick={() => setAddLiabilityOpen(true)} title="Add liability" />
                ) : null
              }
            >
              <LiabilityTable
                liabilities={liabilities}
                prevLiabilities={prevLiabilities}
                setLiabilities={(next) => setAssetsAndUpdateSnapshot(assets, next)}
                liabilityTypes={liabilityTypes}
                onEdit={(l) => setEditLiability(l)}
              />
            </Section>

        </div>
        <footer className="text-center text-xs text-zinc-500 mt-12">v{pkg.version}</footer>
        <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} assetTypes={assetTypes} onAdd={addAsset} />
        <AddLiabilityModal
          open={addLiabilityOpen}
          onClose={() => setAddLiabilityOpen(false)}
          liabilityTypes={liabilityTypes}
          onAdd={addLiability}
        />
        <EditAssetModal
          open={!!editAsset}
          asset={editAsset}
          onClose={() => setEditAsset(null)}
          assetTypes={assetTypes}
          onSave={updateAsset}
          onDelete={requestDeleteAsset}
        />
        <EditLiabilityModal
          open={!!editLiability}
          liability={editLiability}
          onClose={() => setEditLiability(null)}
          liabilityTypes={liabilityTypes}
          onSave={updateLiability}
          onDelete={requestDeleteLiability}
        />
        <ConfirmModal
          open={!!assetToDelete}
          title="Remove asset?"
          onConfirm={confirmDeleteAsset}
          onCancel={cancelDeleteAsset}
        />
        <ConfirmModal
          open={!!liabilityToDelete}
          title="Remove liability?"
          onConfirm={confirmDeleteLiability}
          onCancel={cancelDeleteLiability}
        />
        </>
      )}

      {configOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6">
          <div className="bg-zinc-900 rounded-xl p-6 max-w-3xl w-full max-h-full overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuration</h2>
              <button onClick={() => setConfigOpen(false)} title="Close" className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center">✖</button>
            </div>
            <ConfigPage
              assetTypes={assetTypes}
              setAssetTypes={setAssetTypes}
              liabilityTypes={liabilityTypes}
              setLiabilityTypes={setLiabilityTypes}
              allocation={allocation}
              setAllocation={setAllocation}
              assets={assets}
              liabilities={liabilities}
            />
          </div>
        </div>
      )}
    </div>
  );
}
