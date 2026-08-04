import React, { useEffect, useMemo, useState } from "react";
import AddAssetModal from "./components/AddAssetModal.jsx";
import AddBtn from "./components/AddBtn.jsx";
import AddLiabilityModal from "./components/AddLiabilityModal.jsx";
import AssetTable from "./components/AssetTable.jsx";
import ConcentrationPanel from "./components/ConcentrationPanel.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import EditAssetModal from "./components/EditAssetModal.jsx";
import EditLiabilityModal from "./components/EditLiabilityModal.jsx";
import IncomeSection from "./components/IncomeSection.jsx";
import JsonEditorModal from "./components/JsonEditorModal.jsx";
import LiabilityTable from "./components/LiabilityTable.jsx";
import LineChart from "./components/LineChart.jsx";
import PieChart from "./components/PieChart.jsx";
import Section from "./components/Section.jsx";
import SnapshotTabs from "./components/SnapshotTabs.jsx";
import ScopeHistoryChart from "./components/ScopeHistoryChart.jsx";
import StackedAreaChart from "./components/StackedAreaChart.jsx";
import SurplusPlan from "./components/SurplusPlan.jsx";
import TextInput from "./components/TextInput.jsx";
import {
  assetInPortfolioView,
  assetValue,
  buildPortfolioComparisonSeries,
  buildSeries,
  cloneDefaults,
  currentByDimension,
  defaultAssetTypes,
  defaultDimensions,
  defaultLiabilityTypes,
  defaultStrategy,
  dimensionRegistry,
  normalizeStoredAsset,
  portfolioMetrics,
  portfolioViews,
  recommendSurplusCash,
} from "./data.js";
import { initDrive } from "./drive.js";
import { DEFAULT_PORTFOLIO, upgradePortfolio } from "./file.js";
import useAssetManager from "./hooks/useAssetManager.js";
import useLiabilityManager from "./hooks/useLiabilityManager.js";
import usePortfolioFile from "./hooks/usePortfolioFile.js";
import useSnapshots from "./hooks/useSnapshots.js";
import { formatCurrency, labelFor, mkId } from "./utils.js";
import pkg from "../package.json";

export default function App() {
  const [assetTypes, setAssetTypes] = useState(() => cloneDefaults(defaultAssetTypes));
  const [liabilityTypes, setLiabilityTypes] = useState(() => cloneDefaults(defaultLiabilityTypes));
  const [currency, setCurrency] = useState(DEFAULT_PORTFOLIO.currency);
  const [dimensions, setDimensions] = useState(() => cloneDefaults(defaultDimensions));
  const [strategy, setStrategy] = useState(() => cloneDefaults(defaultStrategy));
  const [incomeRecords, setIncomeRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [chartMode, setChartMode] = useState("total");
  const [portfolioView, setPortfolioView] = useState("total");
  const [selectedDimension, setSelectedDimension] = useState("asset_type");
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addLiabilityOpen, setAddLiabilityOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editLiability, setEditLiability] = useState(null);
  const [showTarget, setShowTarget] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);

  const driveApiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const driveClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const driveConfigured = Boolean(driveApiKey && driveClientId);
  const [driveAvailable, setDriveAvailable] = useState(driveConfigured);

  const builtAgo = useMemo(() => {
    const timestamp = import.meta.env.VITE_BUILD_TIME;
    if (!timestamp) return null;
    const difference = Date.now() - new Date(timestamp).getTime();
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return formatter.format(-days, "day");
    if (hours > 0) return formatter.format(-hours, "hour");
    if (minutes > 0) return formatter.format(-minutes, "minute");
    return formatter.format(-seconds, "second");
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
    handleChangeSnapshotCashFlow,
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
    currency,
    setCurrency,
    dimensions,
    setDimensions,
    strategy,
    setStrategy,
    incomeRecords,
    setIncomeRecords,
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
  } = useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset });

  const {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
  } = useLiabilityManager({ assets, liabilities, liabilityTypes, setAssetsAndUpdateSnapshot, setEditLiability });

  useEffect(() => {
    if (!driveConfigured) return;
    initDrive({ apiKey: driveApiKey, clientId: driveClientId })
      .then((ready) => {
        setDriveAvailable(Boolean(ready));
        if (!ready) setError("Google Drive could not be initialized. Drive operations are disabled.");
      })
      .catch(() => {
        setDriveAvailable(false);
        setError("Google Drive could not be initialized. Drive operations are disabled.");
      });
  }, [driveConfigured, driveApiKey, driveClientId, setError]);

  function handleJsonSave(object) {
    const data = upgradePortfolio(object);
    const orderedSnapshots = (data.snapshots || []).slice().sort((left, right) => new Date(left.asOf) - new Date(right.asOf));
    const nextAssetTypes = data.assetTypes || cloneDefaults(defaultAssetTypes);
    const nextLiabilityTypes = data.liabilityTypes || cloneDefaults(defaultLiabilityTypes);
    setSnapshots(orderedSnapshots);
    const latest = orderedSnapshots[orderedSnapshots.length - 1];
    if (latest) {
      setAssets((latest.assets || []).map((asset) => normalizeStoredAsset({
        ...asset,
        id: asset.id || mkId(),
        name: asset.name || labelFor(asset.type, nextAssetTypes),
      }, nextAssetTypes)));
      setLiabilities((latest.liabilities || []).map((liability) => ({
        ...liability,
        id: liability.id || mkId(),
        name: liability.name || labelFor(liability.type, nextLiabilityTypes),
        priority: !!liability.priority,
      })));
      setCurrentIndex(orderedSnapshots.length - 1);
    } else {
      setAssets([]);
      setLiabilities([]);
      setCurrentIndex(0);
    }
    setCurrency(data.currency || DEFAULT_PORTFOLIO.currency);
    setDimensions(data.dimensions || cloneDefaults(defaultDimensions));
    setStrategy(data.strategy || cloneDefaults(defaultStrategy));
    setIncomeRecords(data.incomeRecords || []);
    setAssetTypes(nextAssetTypes);
    setLiabilityTypes(nextLiabilityTypes);
  }

  const metrics = useMemo(() => portfolioMetrics(assets, liabilities), [assets, liabilities]);
  const headlineValue = portfolioView === "total"
    ? metrics.totalNetWorth
    : portfolioView === "investable"
    ? metrics.investableAssets
    : metrics.financialPortfolio;
  const series = useMemo(() => buildSeries(snapshots, period, portfolioView, assetTypes), [snapshots, period, portfolioView, assetTypes]);
  const comparisonSeries = useMemo(() => buildPortfolioComparisonSeries(snapshots, period), [snapshots, period]);
  const currentAmounts = useMemo(
    () => currentByDimension(assets, selectedDimension, assetTypes, {}, portfolioView),
    [assets, selectedDimension, assetTypes, portfolioView]
  );
  const selectedPolicy = strategy.dimensionPolicies?.[selectedDimension] || {};
  const targetAmounts = useMemo(() => {
    if (portfolioView !== "financial" || selectedPolicy.mode !== "target") return {};
    return Object.fromEntries(Object.entries(selectedPolicy.categories || {}).map(([category, config]) => [
      category,
      metrics.financialPortfolio * ((Number(config.target) || 0) / 100),
    ]));
  }, [portfolioView, selectedPolicy, metrics.financialPortfolio]);
  const selectedRegistry = dimensionRegistry(selectedDimension, assetTypes, dimensions);
  const recommendation = useMemo(
    () => recommendSurplusCash(assets, strategy, assetTypes, dimensions),
    [assets, strategy, assetTypes, dimensions]
  );
  const previousAssets = currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : [];
  const previousLiabilities = currentIndex > 0 ? snapshots[currentIndex - 1]?.liabilities || [] : [];
  const previousMetrics = currentIndex > 0 ? portfolioMetrics(previousAssets, previousLiabilities) : null;
  const previousHeadline = previousMetrics == null
    ? null
    : portfolioView === "total"
    ? previousMetrics.totalNetWorth
    : portfolioView === "investable"
    ? previousMetrics.investableAssets
    : previousMetrics.financialPortfolio;
  const currentSnapshot = snapshots[currentIndex];
  const nominalChange = previousHeadline == null ? null : headlineValue - previousHeadline;
  const netExternalFlow = (Number(currentSnapshot?.contributions) || 0) - (Number(currentSnapshot?.withdrawals) || 0);
  const investmentChange = nominalChange == null ? null : nominalChange - netExternalFlow;
  const visibleAssets = assets.filter((asset) => portfolioView === "total" || assetInPortfolioView(asset, portfolioView));
  const previousVisibleAssets = previousAssets.filter((asset) => portfolioView === "total" || assetInPortfolioView(asset, portfolioView));
  const latestValuationDate = visibleAssets.reduce((latest, asset) => asset.valuationDate && asset.valuationDate > latest ? asset.valuationDate : latest, "");
  const isLatestSnapshot = currentIndex === snapshots.length - 1;
  const viewDescriptions = {
    total: "All material assets less simplified liabilities.",
    investable: "Accessible capital that can be invested or rebalanced.",
    financial: "Assets actively managed under your investment strategy.",
  };

  function updateVisibleAssets(nextVisibleAssets) {
    const updates = new Map(nextVisibleAssets.map((asset) => [asset.id, asset]));
    setAssetsAndUpdateSnapshot(assets.map((asset) => updates.get(asset.id) || asset));
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {step === "pick" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
          {error && <div className="max-w-lg p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
          <button onClick={handleOpenExisting} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Open existing file</button>
          <button onClick={handleCreateNew} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Create new file</button>
          {driveAvailable && <button onClick={handleOpenDrive} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500">Open from Google Drive</button>}
          <button onClick={handleOpenSample} className="text-sm text-blue-400 underline">Open sample portfolio</button>
          {builtAgo && <div className="text-sm text-zinc-400">Built {builtAgo}</div>}
        </div>
      )}

      {step === "password" && (
        <form onSubmit={(event) => { event.preventDefault(); handleLoad(); }} className="max-w-md mx-auto p-6 space-y-4">
          {error && <div className="text-red-400">{error}</div>}
          <TextInput label="Password" type="password" value={password} onChange={setPassword} className="w-full" autoFocus />
          <div className="flex justify-between">
            <button type="button" onClick={() => { setFileHandle(null); setPassword(""); setError(null); setStep("pick"); }} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Cancel</button>
            <button type="submit" className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Open</button>
          </div>
        </form>
      )}

      {step === "main" && (
        <>
          <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold">Portfolio Strategy Tracker</h1>
                <p className="text-sm text-zinc-400">Private by default · Monthly check-ins · Explainable allocation guidance</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleSave} title="Save" className={`h-10 w-10 rounded-lg border flex items-center justify-center text-xl ${dirty ? "bg-blue-600 hover:bg-blue-500 border-blue-500" : "bg-zinc-800 border-zinc-700 hover:bg-zinc-700"}`}>💾</button>
                {dirty && <span className="text-amber-400" title="Unsaved changes">●</span>}
                <button onClick={() => setConfigOpen(true)} title="Configuration" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl">⚙</button>
                <button onClick={handleCloseFile} title="Close" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center text-xl">✖</button>
              </div>
            </header>

            {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
            {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}

            <div className="grid sm:grid-cols-3 rounded-xl overflow-hidden border border-zinc-700">
              {Object.entries(portfolioViews).map(([key, view]) => (
                <button
                  key={key}
                  onClick={() => setPortfolioView(key)}
                  className={`p-3 text-left border-zinc-700 sm:[&:not(:first-child)]:border-l ${portfolioView === key ? "bg-blue-600" : "bg-zinc-900 hover:bg-zinc-800"}`}
                >
                  <div className="font-medium">{view.name}</div>
                  <div className={`text-xs mt-1 ${portfolioView === key ? "text-blue-100" : "text-zinc-500"}`}>
                    {key === "total" ? formatCurrency(metrics.totalNetWorth, currency) : key === "investable" ? formatCurrency(metrics.investableAssets, currency) : formatCurrency(metrics.financialPortfolio, currency)}
                  </div>
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Section
                title="Portfolio overview"
                right={portfolioView === "financial" && selectedPolicy.mode === "target" ? (
                  <button
                    onMouseDown={() => setShowTarget(true)}
                    onMouseUp={() => setShowTarget(false)}
                    onMouseLeave={() => setShowTarget(false)}
                    className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs"
                    title="Show target while held"
                  >
                    Hold for target
                  </button>
                ) : null}
              >
                <div className="mb-3">
                  <div className="text-xs text-zinc-500">{portfolioViews[portfolioView].name}</div>
                  <div className="text-2xl font-semibold">{formatCurrency(headlineValue, currency)}</div>
                  <div className="text-xs text-zinc-400 mt-1">{viewDescriptions[portfolioView]}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div><div className="text-xs text-zinc-500">Total assets</div><div>{formatCurrency(metrics.totalAssets, currency)}</div></div>
                  <div><div className="text-xs text-zinc-500">Investable</div><div>{formatCurrency(metrics.investableAssets, currency)}</div></div>
                  <div><div className="text-xs text-zinc-500">Financial</div><div>{formatCurrency(metrics.financialPortfolio, currency)}</div></div>
                </div>
                <PieChart data={currentAmounts} targetData={targetAmounts} showTarget={showTarget} assetTypes={selectedRegistry} />
                <div className="mt-2 text-xs text-zinc-500">
                  {latestValuationDate ? `Latest asset valuation: ${latestValuationDate}` : "No valuation date recorded"}
                </div>
              </Section>

              <Section
                title="History"
                right={(
                  <div className="flex items-center gap-2">
                    <select value={period} onChange={(event) => setPeriod(event.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-sm">
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <div className="flex rounded-lg overflow-hidden border border-zinc-700 text-sm">
                      <button onClick={() => setChartMode("total")} className={`px-2 py-1 ${chartMode === "total" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}>Current view</button>
                      <button onClick={() => setChartMode("category")} className={`px-2 py-1 ${chartMode === "category" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}>By asset type</button>
                      <button onClick={() => setChartMode("scopes")} className={`px-2 py-1 ${chartMode === "scopes" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`}>Compare scopes</button>
                    </div>
                  </div>
                )}
              >
                {chartMode === "total" && <LineChart data={series} currency={currency} showGridlines={series.length > 2} showMarkers={series.length > 2} showVerticalGridlines={period === "monthly"} />}
                {chartMode === "category" && <StackedAreaChart data={series} assetTypes={assetTypes} currency={currency} />}
                {chartMode === "scopes" && <ScopeHistoryChart data={comparisonSeries} currency={currency} />}
                {nominalChange != null && (
                  <div className={`grid ${portfolioView === "total" ? "grid-cols-3" : "grid-cols-1"} gap-2 mt-3 text-xs`}>
                    <div><span className="text-zinc-500">Change </span>{formatCurrency(nominalChange, currency)}</div>
                    {portfolioView === "total" && <div><span className="text-zinc-500">Net added </span>{formatCurrency(netExternalFlow, currency)}</div>}
                    {portfolioView === "total" && <div><span className="text-zinc-500">Investment change </span>{formatCurrency(investmentChange, currency)}</div>}
                  </div>
                )}
              </Section>
            </div>

            <Section title="Cash reserve and next investment">
              <SurplusPlan recommendation={recommendation} assets={assets} strategy={strategy} assetTypes={assetTypes} dimensions={dimensions} currency={currency} />
            </Section>

            <Section title="Portfolio concentration">
              <ConcentrationPanel
                assets={assets}
                assetTypes={assetTypes}
                dimensions={dimensions}
                strategy={strategy}
                currency={currency}
                selectedDimension={selectedDimension}
                onSelectDimension={setSelectedDimension}
                portfolioView={portfolioView}
              />
            </Section>

            <Section title={`${portfolioViews[portfolioView].assetLabel} (${visibleAssets.length})`} right={isLatestSnapshot ? <AddBtn onClick={() => setAddOpen(true)} title="Add asset" /> : null}>
              <SnapshotTabs
                snapshots={snapshots}
                currentIndex={currentIndex}
                onSelect={handleSelectSnapshot}
                onAdd={handleAddSnapshot}
                onChangeDate={handleChangeSnapshotDate}
                onChangeCashFlow={handleChangeSnapshotCashFlow}
                onDelete={handleDeleteSnapshot}
                currency={currency}
              />
              {!isLatestSnapshot && <div className="mb-3 rounded-lg border border-amber-900/60 bg-amber-950/20 p-2 text-xs text-amber-300">Historical snapshot: values are read-only.</div>}
              <AssetTable
                assets={visibleAssets}
                prevAssets={previousVisibleAssets}
                setAssets={updateVisibleAssets}
                assetTypes={assetTypes}
                currency={currency}
                readOnly={!isLatestSnapshot}
                onEdit={setEditAsset}
              />
            </Section>

            {portfolioView === "total" && <Section title="Liabilities" right={isLatestSnapshot ? <AddBtn onClick={() => setAddLiabilityOpen(true)} title="Add liability" /> : null}>
              <LiabilityTable
                liabilities={liabilities}
                prevLiabilities={previousLiabilities}
                setLiabilities={(next) => setAssetsAndUpdateSnapshot(assets, next)}
                liabilityTypes={liabilityTypes}
                currency={currency}
                readOnly={!isLatestSnapshot}
                onEdit={setEditLiability}
              />
            </Section>}

            <Section title="Annual income and costs">
              <IncomeSection records={incomeRecords} setRecords={setIncomeRecords} assets={assets} currency={currency} />
            </Section>
          </div>

          <footer className="text-center text-xs text-zinc-500 py-8">v{pkg.version}</footer>

          <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} assetTypes={assetTypes} dimensions={dimensions} currency={currency} onAdd={addAsset} />
          <AddLiabilityModal open={addLiabilityOpen} onClose={() => setAddLiabilityOpen(false)} liabilityTypes={liabilityTypes} onAdd={addLiability} />
          <EditAssetModal open={!!editAsset} asset={editAsset} onClose={() => setEditAsset(null)} assetTypes={assetTypes} dimensions={dimensions} currency={currency} onSave={updateAsset} onDelete={requestDeleteAsset} />
          <EditLiabilityModal open={!!editLiability} liability={editLiability} onClose={() => setEditLiability(null)} liabilityTypes={liabilityTypes} onSave={updateLiability} onDelete={requestDeleteLiability} />
          <ConfirmModal open={!!assetToDelete} title="Remove asset?" onConfirm={confirmDeleteAsset} onCancel={cancelDeleteAsset} />
          <ConfirmModal open={!!liabilityToDelete} title="Remove liability?" onConfirm={confirmDeleteLiability} onCancel={cancelDeleteLiability} />
          <JsonEditorModal
            open={jsonOpen}
            onClose={() => setJsonOpen(false)}
            data={{ ...DEFAULT_PORTFOLIO, currency, assetTypes, liabilityTypes, dimensions, strategy, incomeRecords, snapshots, liabilities }}
            onSave={handleJsonSave}
          />
        </>
      )}

      {configOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 flex items-center justify-center p-4 md:p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:p-6 max-w-6xl w-full max-h-full overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Configuration</h2>
              <button onClick={() => setConfigOpen(false)} title="Close" className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 flex items-center justify-center">✖</button>
            </div>
            <ConfigPage
              assetTypes={assetTypes}
              setAssetTypes={setAssetTypes}
              liabilityTypes={liabilityTypes}
              setLiabilityTypes={setLiabilityTypes}
              currency={currency}
              setCurrency={setCurrency}
              dimensions={dimensions}
              setDimensions={setDimensions}
              strategy={strategy}
              setStrategy={setStrategy}
              assets={assets}
              liabilities={liabilities}
              onEditJson={() => { setConfigOpen(false); setJsonOpen(true); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
