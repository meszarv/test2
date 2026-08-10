import React, { useEffect, useMemo, useState } from "react";
import AddAssetModal from "./components/AddAssetModal.jsx";
import AddBtn from "./components/AddBtn.jsx";
import AddLiabilityModal from "./components/AddLiabilityModal.jsx";
import AssetTable from "./components/AssetTable.jsx";
import ConcentrationPanel from "./components/ConcentrationPanel.jsx";
import ConfigPage from "./components/ConfigPage.jsx";
import ClosePortfolioModal from "./components/ClosePortfolioModal.jsx";
import ConfirmModal from "./components/ConfirmModal.jsx";
import EditAssetModal from "./components/EditAssetModal.jsx";
import EditLiabilityModal from "./components/EditLiabilityModal.jsx";
import JsonEditorModal from "./components/JsonEditorModal.jsx";
import LiabilityTable from "./components/LiabilityTable.jsx";
import LineChart from "./components/LineChart.jsx";
import PieChart from "./components/PieChart.jsx";
import PortfolioScopeFilter from "./components/PortfolioScopeFilter.jsx";
import PortfolioTotals from "./components/PortfolioTotals.jsx";
import PortfolioViewSelector from "./components/PortfolioViewSelector.jsx";
import Section from "./components/Section.jsx";
import SnapshotTabs from "./components/SnapshotTabs.jsx";
import ScopeHistoryChart from "./components/ScopeHistoryChart.jsx";
import StackedAreaChart from "./components/StackedAreaChart.jsx";
import SurplusPlan from "./components/SurplusPlan.jsx";
import TextInput from "./components/TextInput.jsx";
import UndoToast from "./components/UndoToast.jsx";
import {
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
  portfolioScopeOptions,
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

const workflowSections = [
  { key: "update", label: "Update portfolio", description: "Record current holdings and liabilities." },
  { key: "analysis", label: "Analysis", description: "Review totals, allocation, history, and concentration." },
  { key: "guidance", label: "Guidance", description: "Review cash reserve and the next investment." },
];

export default function App() {
  const [assetTypes, setAssetTypes] = useState(() => cloneDefaults(defaultAssetTypes));
  const [liabilityTypes, setLiabilityTypes] = useState(() => cloneDefaults(defaultLiabilityTypes));
  const [currency, setCurrency] = useState(DEFAULT_PORTFOLIO.currency);
  const [dimensions, setDimensions] = useState(() => cloneDefaults(defaultDimensions));
  const [strategy, setStrategy] = useState(() => cloneDefaults(defaultStrategy));
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [period, setPeriod] = useState("monthly");
  const [chartMode, setChartMode] = useState("total");
  const [portfolioView, setPortfolioView] = useState("total");
  const [visiblePortfolioScopes, setVisiblePortfolioScopes] = useState(() => Object.keys(portfolioScopeOptions));
  const [mainSection, setMainSection] = useState("update");
  const [selectedDimension, setSelectedDimension] = useState("asset_type");
  const [configOpen, setConfigOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addLiabilityOpen, setAddLiabilityOpen] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [editLiability, setEditLiability] = useState(null);
  const [showTarget, setShowTarget] = useState(false);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [closePortfolioOpen, setClosePortfolioOpen] = useState(false);

  const driveApiKey = __GOOGLE_API_KEY__;
  const driveClientId = __GOOGLE_CLIENT_ID__;
  const driveConfigured = Boolean(driveApiKey && driveClientId);
  const [driveAvailable, setDriveAvailable] = useState(driveConfigured);

  const builtAgo = useMemo(() => {
    const timestamp = __BUILD_TIME__;
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
    handleDeleteSnapshot,
    handleRestoreSnapshot,
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
    lastSavedAt,
    canSave,
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
    snapshots,
    setSnapshots,
    snapshotFromAssets,
    setCurrentIndex,
  });

  useEffect(() => {
    if (step === "main") {
      setMainSection("update");
      setPortfolioView("total");
      setVisiblePortfolioScopes(Object.keys(portfolioScopeOptions));
    }
  }, [step]);

  const {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset,
    deletedAsset,
    undoDeleteAsset,
    clearDeletedAsset,
  } = useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset });

  const {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
    deletedLiability,
    undoDeleteLiability,
    clearDeletedLiability,
  } = useLiabilityManager({ assets, liabilities, setAssetsAndUpdateSnapshot, setEditLiability });

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
  const nominalChange = previousHeadline == null ? null : headlineValue - previousHeadline;
  const visibleAssets = assets.filter((asset) => visiblePortfolioScopes.includes(asset.portfolioScope));
  const previousVisibleAssets = previousAssets.filter((asset) => visiblePortfolioScopes.includes(asset.portfolioScope));
  const visibleAssetLabel = visiblePortfolioScopes.length === Object.keys(portfolioScopeOptions).length
    ? "Total Assets"
    : visiblePortfolioScopes.length === 1
    ? portfolioScopeOptions[visiblePortfolioScopes[0]].name
    : "Filtered Assets";
  const isLatestSnapshot = currentIndex === snapshots.length - 1;
  const referencedCurrencies = Array.from(new Set([
    currency,
    ...snapshots.flatMap((snapshot) => (snapshot.assets || []).map((asset) => asset.pricingCurrency)).filter(Boolean),
  ]));

  function requestClosePortfolio() {
    if (dirty) setClosePortfolioOpen(true);
    else handleCloseFile({ save: false });
  }

  async function saveAndClosePortfolio() {
    const result = await handleCloseFile({ save: true });
    if (result !== false) setClosePortfolioOpen(false);
  }

  async function discardAndClosePortfolio() {
    const result = await handleCloseFile({ save: false });
    if (result !== false) setClosePortfolioOpen(false);
  }

  function handleMainSectionChange(section) {
    if (section === "guidance" && snapshots.length && currentIndex !== snapshots.length - 1) {
      handleSelectSnapshot(snapshots.length - 1);
    }
    setMainSection(section);
  }

  function updateVisibleAssets(nextVisibleAssets) {
    const updates = new Map(nextVisibleAssets.map((asset) => [asset.id, asset]));
    setAssetsAndUpdateSnapshot(assets.map((asset) => updates.get(asset.id) || asset));
  }

  function togglePortfolioScope(scope) {
    setVisiblePortfolioScopes((current) => current.includes(scope)
      ? current.filter((item) => item !== scope)
      : Object.keys(portfolioScopeOptions).filter((item) => item === scope || current.includes(item)));
  }

  const mainContent = mainSection === "update" ? (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Update portfolio</h2>
        <p className="mt-1 text-sm text-zinc-400">Update the latest holdings and liabilities before reviewing the portfolio.</p>
      </div>

      <PortfolioScopeFilter
        values={visiblePortfolioScopes}
        onToggle={togglePortfolioScope}
        title="Asset scopes"
        description="Each switch controls one assigned scope. Combine them to show any subset of holdings."
      />

      <Section title={`${visibleAssetLabel} (${visibleAssets.length})`} right={isLatestSnapshot ? <AddBtn onClick={() => setAddOpen(true)} title="Add asset" /> : null}>
        <SnapshotTabs
          snapshots={snapshots}
          currentIndex={currentIndex}
          onSelect={handleSelectSnapshot}
          onAdd={handleAddSnapshot}
          onChangeDate={handleChangeSnapshotDate}
          onDelete={handleDeleteSnapshot}
          onRestore={handleRestoreSnapshot}
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

      {visiblePortfolioScopes.includes("total") && <Section title="Liabilities" right={isLatestSnapshot ? <AddBtn onClick={() => setAddLiabilityOpen(true)} title="Add liability" /> : null}>
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

      <div className="flex justify-end">
        <button type="button" onClick={() => handleMainSectionChange("analysis")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {isLatestSnapshot ? "Review updated analysis" : "Review selected analysis"} →
        </button>
      </div>
    </div>
  ) : mainSection === "guidance" ? (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Guidance</h2>
        <p className="mt-1 text-sm text-zinc-400">Act on cash reserve and next-investment guidance calculated from the latest check-in.</p>
      </div>

      <Section title="Cash reserve and next investment">
        <SurplusPlan recommendation={recommendation} assets={assets} strategy={strategy} assetTypes={assetTypes} dimensions={dimensions} currency={currency} />
      </Section>
    </div>
  ) : (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Analysis</h2>
        <p className="mt-1 text-sm text-zinc-400">Review totals, allocation, concentration, and history from different portfolio views.</p>
      </div>

      <PortfolioTotals metrics={metrics} requiredCashReserve={recommendation.effectiveReserveTarget} currency={currency} />

      <PortfolioViewSelector
        value={portfolioView}
        onChange={setPortfolioView}
        title="Analysis view"
        description="Filters allocation, concentration, and current-view history."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Current allocation"
          right={portfolioView === "financial" && selectedPolicy.mode === "target" ? (
            <button
              onMouseDown={() => setShowTarget(true)}
              onMouseUp={() => setShowTarget(false)}
              onMouseLeave={() => setShowTarget(false)}
              className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700"
              title="Show target while held"
            >
              Hold for target
            </button>
          ) : null}
        >
          <div className="mb-3 text-sm text-zinc-400">{portfolioViews[portfolioView].name} by {selectedDimension === "asset_type" ? "asset type" : dimensions[selectedDimension]?.name || selectedDimension}</div>
          <PieChart data={currentAmounts} targetData={targetAmounts} showTarget={showTarget} assetTypes={selectedRegistry} />
        </Section>

        <Section
          title="History"
          right={(
            <div className="flex items-center gap-2">
              <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <div className="flex overflow-hidden rounded-lg border border-zinc-700 text-sm">
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
            <div className="mt-3 text-xs">
              <div><span className="text-zinc-500">Change </span>{formatCurrency(nominalChange, currency)}</div>
            </div>
          )}
        </Section>
      </div>

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

      <div className="flex justify-end">
        <button type="button" onClick={() => handleMainSectionChange("guidance")} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">
          Review latest guidance →
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {step === "pick" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-4">
          {error && <div className="max-w-lg p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
          {loading && <div className="text-sm text-zinc-400">Opening portfolio…</div>}
          <button disabled={loading} onClick={handleOpenExisting} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Open existing file</button>
          <button disabled={loading} onClick={handleCreateNew} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Create new file</button>
          {driveAvailable && <button disabled={loading} onClick={handleOpenDrive} className="h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">Open from Google Drive</button>}
          <button disabled={loading} onClick={handleOpenSample} className="text-sm text-blue-400 underline disabled:opacity-50">Open sample portfolio</button>
          {builtAgo && <div className="text-sm text-zinc-400">Built {builtAgo}</div>}
        </div>
      )}

      {step === "password" && (
        <form onSubmit={(event) => { event.preventDefault(); handleLoad(); }} className="max-w-md mx-auto p-6 space-y-4">
          {error && <div className="text-red-400">{error}</div>}
          <TextInput label="Password" type="password" value={password} onChange={setPassword} className="w-full" autoFocus />
          <div className="flex justify-between">
            <button type="button" disabled={loading} onClick={() => { setFileHandle(null); setPassword(""); setError(null); setStep("pick"); }} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading || !password} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Opening…" : "Open"}</button>
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
              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className={dirty ? "text-amber-400" : "text-zinc-400"}>{dirty ? "● Unsaved changes" : canSave ? "Saved" : "Sample portfolio · not saved to a file"}</div>
                  {!dirty && lastSavedAt && <div className="text-zinc-600">Saved at {lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                </div>
                <button onClick={handleSave} disabled={loading || !canSave || !dirty} className={`h-10 rounded-lg border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${dirty && canSave ? "border-blue-500 bg-blue-600 hover:bg-blue-500" : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"}`}>{loading ? "Saving…" : "Save"}</button>
                <button onClick={() => setConfigOpen(true)} className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm hover:bg-zinc-700">Settings</button>
                <button onClick={requestClosePortfolio} disabled={loading} className="h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm hover:bg-zinc-700 disabled:opacity-50">Close portfolio</button>
              </div>
            </header>

            {error && <div className="p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200">{error}</div>}
            {loading && <div className="p-3 rounded-xl bg-zinc-800 text-zinc-300">Working…</div>}

            <div className="md:hidden">
              <label className="block text-sm">
                <span className="sr-only">Portfolio workflow section</span>
                <select value={mainSection} onChange={(event) => handleMainSectionChange(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {workflowSections.map((section, index) => <option key={section.key} value={section.key}>{index + 1}. {section.label}</option>)}
                </select>
              </label>
            </div>

            <div className="flex items-start gap-6">
              <nav className="sticky top-4 hidden w-60 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 md:block" aria-label="Portfolio workflow">
                {workflowSections.map((section, index) => (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => handleMainSectionChange(section.key)}
                    aria-current={mainSection === section.key ? "page" : undefined}
                    className={`mb-1 flex w-full gap-3 rounded-lg px-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${mainSection === section.key ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-900"}`}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${mainSection === section.key ? "bg-white/20" : "bg-zinc-800"}`}>{index + 1}</span>
                    <span>
                      <span className="block text-sm font-medium">{section.label}</span>
                      <span className={`mt-0.5 block text-xs ${mainSection === section.key ? "text-blue-100" : "text-zinc-500"}`}>{section.description}</span>
                    </span>
                  </button>
                ))}
              </nav>
              <main className="min-w-0 flex-1">{mainContent}</main>
            </div>
          </div>

          <footer className="text-center text-xs text-zinc-500 py-8">v{pkg.version}</footer>

          <AddAssetModal open={addOpen} onClose={() => setAddOpen(false)} assetTypes={assetTypes} assets={assets} dimensions={dimensions} currency={currency} referencedCurrencies={referencedCurrencies} onAdd={addAsset} />
          <AddLiabilityModal open={addLiabilityOpen} onClose={() => setAddLiabilityOpen(false)} liabilityTypes={liabilityTypes} currency={currency} onAdd={addLiability} />
          <EditAssetModal open={!!editAsset} asset={editAsset} onClose={() => setEditAsset(null)} assetTypes={assetTypes} assets={assets} dimensions={dimensions} currency={currency} referencedCurrencies={referencedCurrencies} onSave={updateAsset} onDelete={requestDeleteAsset} />
          <EditLiabilityModal open={!!editLiability} liability={editLiability} onClose={() => setEditLiability(null)} liabilityTypes={liabilityTypes} currency={currency} onSave={updateLiability} onDelete={requestDeleteLiability} />
          <ConfirmModal open={!!assetToDelete} title="Delete asset?" message={assetToDelete ? `Delete “${assetToDelete.name}” from the current portfolio snapshot?` : ""} onConfirm={confirmDeleteAsset} onCancel={cancelDeleteAsset} />
          <ConfirmModal open={!!liabilityToDelete} title="Delete liability?" message={liabilityToDelete ? `Delete “${liabilityToDelete.name}” from the current portfolio snapshot?` : ""} onConfirm={confirmDeleteLiability} onCancel={cancelDeleteLiability} />
          <JsonEditorModal
            open={jsonOpen}
            onClose={() => setJsonOpen(false)}
            data={{ ...DEFAULT_PORTFOLIO, currency, assetTypes, liabilityTypes, dimensions, strategy, snapshots }}
            onSave={handleJsonSave}
          />
          <ClosePortfolioModal open={closePortfolioOpen} canSave={canSave} loading={loading} onCancel={() => setClosePortfolioOpen(false)} onSaveAndClose={saveAndClosePortfolio} onDiscardAndClose={discardAndClosePortfolio} />
          <UndoToast message={deletedAsset ? `Asset “${deletedAsset.asset.name}” deleted.` : ""} onUndo={undoDeleteAsset} onDismiss={clearDeletedAsset} />
          <UndoToast message={deletedLiability ? `Liability “${deletedLiability.liability.name}” deleted.` : ""} onUndo={undoDeleteLiability} onDismiss={clearDeletedLiability} />
        </>
      )}

      {configOpen && (
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
          assets={snapshots[snapshots.length - 1]?.assets || assets}
          liabilities={snapshots[snapshots.length - 1]?.liabilities || liabilities}
          dirty={dirty}
          driveConfigured={driveConfigured}
          driveAvailable={driveAvailable}
          onDone={() => setConfigOpen(false)}
          onEditJson={() => setJsonOpen(true)}
          onReviewScopes={() => {
            setConfigOpen(false);
            setMainSection("update");
            setPortfolioView("total");
            if (snapshots.length) handleSelectSnapshot(snapshots.length - 1);
          }}
          referencedCurrencies={referencedCurrencies}
          nestedDialogOpen={jsonOpen}
        />
      )}
    </div>
  );
}
