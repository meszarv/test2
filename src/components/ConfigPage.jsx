import { useEffect, useMemo, useRef, useState } from "react";
import AssetTypeManager from "./AssetTypeManager.jsx";
import LiabilityTypeManager from "./LiabilityTypeManager.jsx";
import DimensionManager from "./DimensionManager.jsx";
import StrategyEditor from "./StrategyEditor.jsx";
import TextInput from "./TextInput.jsx";
import { assetInPortfolioView, portfolioMetrics, portfolioViews } from "../data.js";
import { formatCurrency } from "../utils.js";
import { CollapsiblePanel, SettingsSectionHeader, SettingsSummaryCard, SettingsValidation } from "./SettingsUI.jsx";

const sections = [
  { key: "general", label: "General" },
  { key: "views", label: "Portfolio Views" },
  { key: "strategy", label: "Strategy" },
  { key: "asset_types", label: "Asset Types" },
  { key: "dimensions", label: "Dimensions" },
  { key: "liability_types", label: "Liability Types" },
  { key: "data", label: "Data & Integrations" },
];

function GeneralSettings({ currency, setCurrency }) {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title="General" description="Portfolio-wide display settings." />
      <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <TextInput label="Base currency" value={currency} onChange={(value) => setCurrency(value.toUpperCase())} />
        <p className="mt-2 text-xs text-zinc-500">Values and totals are displayed in this currency. Asset pricing currencies and FX rates remain separate.</p>
      </div>
    </div>
  );
}

function PortfolioViewSettings({ assets, liabilities, currency, onReviewScopes }) {
  const metrics = useMemo(() => portfolioMetrics(assets, liabilities), [assets, liabilities]);
  const active = (assets || []).filter((asset) => asset.status !== "closed" && asset.status !== "sold");
  const counts = {
    total: active.length,
    investable: active.filter((asset) => assetInPortfolioView(asset, "investable")).length,
    financial: active.filter((asset) => assetInPortfolioView(asset, "financial")).length,
  };
  const reviewCount = active.filter((asset) => asset.scopeNeedsReview).length;
  const values = {
    total: metrics.totalNetWorth,
    investable: metrics.investableAssets,
    financial: metrics.financialPortfolio,
  };
  const descriptions = {
    total: "All active material assets less simplified liabilities.",
    investable: "Accessible assets that can be invested or rebalanced.",
    financial: "Assets actively managed under the investment strategy.",
  };

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Portfolio Views"
        description="Each asset has one scope. Narrower scopes are automatically included in the broader views."
      />
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center text-sm text-zinc-300">
        <span className="text-amber-300">Financial Portfolio</span>
        <span className="mx-2 text-zinc-600">⊆</span>
        <span className="text-emerald-300">Investable Assets</span>
        <span className="mx-2 text-zinc-600">⊆</span>
        <span className="text-blue-300">Total Assets</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {Object.entries(portfolioViews).map(([key, view]) => (
          <SettingsSummaryCard
            key={key}
            label={view.name}
            value={formatCurrency(values[key], currency)}
            description={`${counts[key]} active asset${counts[key] === 1 ? "" : "s"} · ${descriptions[key]}`}
          />
        ))}
      </div>
      {reviewCount > 0 ? (
        <SettingsValidation>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{reviewCount} asset{reviewCount === 1 ? "" : "s"} still require a portfolio-scope review.</span>
            <button type="button" onClick={onReviewScopes} className="rounded-lg bg-amber-700 px-3 py-2 text-xs text-white hover:bg-amber-600">Review assets</button>
          </div>
        </SettingsValidation>
      ) : (
        <SettingsValidation valid>All active assets have a confirmed portfolio scope.</SettingsValidation>
      )}
      <p className="text-sm text-zinc-500">Scope semantics are fixed. Change an individual asset’s scope from its edit dialog, or configure defaults and locks under Asset Types.</p>
    </div>
  );
}

function DataSettings({ driveConfigured, driveAvailable, onEditJson }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const driveLabel = driveAvailable ? "Available" : driveConfigured ? "Unavailable" : "Not configured";
  const driveDescription = driveAvailable
    ? "Google Drive operations are ready."
    : driveConfigured
    ? "Google Drive initialization failed, so Drive operations are disabled."
    : "This build does not contain the required Google API credentials.";
  return (
    <div className="space-y-6">
      <SettingsSectionHeader title="Data & Integrations" description="File storage, integrations, and advanced portfolio controls." />
      <div className="grid md:grid-cols-2 gap-3">
        <SettingsSummaryCard label="Portfolio file" value="Encrypted local file" description="Saving, encryption, import, and export behavior are unchanged." />
        <SettingsSummaryCard label="Google Drive" value={driveLabel} description={driveDescription} tone={driveAvailable ? "default" : "warning"} />
      </div>
      <CollapsiblePanel
        title="Advanced"
        summary="Inspect or edit the raw portfolio JSON"
        open={advancedOpen}
        onToggle={() => setAdvancedOpen((value) => !value)}
      >
        <div className="space-y-3">
          <SettingsValidation>Manual structural changes or invalid data can make the portfolio unreadable. Use this only when you understand the file structure.</SettingsValidation>
          <button type="button" onClick={onEditJson} title="Edit JSON" className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700">Edit JSON</button>
        </div>
      </CollapsiblePanel>
    </div>
  );
}

export default function ConfigPage({
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
  assets,
  liabilities,
  dirty = false,
  driveConfigured = false,
  driveAvailable = false,
  onEditJson,
  onDone,
  onReviewScopes,
}) {
  const [activeSection, setActiveSection] = useState("general");
  const mainRef = useRef(null);
  const firstSectionRender = useRef(true);
  const targetIssues = Object.values(strategy.dimensionPolicies || {}).filter((policy) => {
    if (policy.mode !== "target") return false;
    const total = Object.values(policy.categories || {}).reduce((sum, category) => sum + (Number(category.target) || 0), 0);
    return Math.abs(total - 100) >= 0.01;
  }).length;
  const reviewCount = (assets || []).filter((asset) => asset.scopeNeedsReview && asset.status !== "closed" && asset.status !== "sold").length;
  const issueCounts = { views: reviewCount, strategy: targetIssues };

  useEffect(() => {
    if (firstSectionRender.current) {
      firstSectionRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [activeSection]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  function content() {
    if (activeSection === "general") return <GeneralSettings currency={currency} setCurrency={setCurrency} />;
    if (activeSection === "views") return <PortfolioViewSettings assets={assets} liabilities={liabilities} currency={currency} onReviewScopes={onReviewScopes} />;
    if (activeSection === "strategy") return <StrategyEditor strategy={strategy} setStrategy={setStrategy} assetTypes={assetTypes} dimensions={dimensions} currency={currency} assets={assets} />;
    if (activeSection === "asset_types") return <AssetTypeManager assetTypes={assetTypes} setAssetTypes={setAssetTypes} assets={assets} dimensions={dimensions} />;
    if (activeSection === "dimensions") return <DimensionManager dimensions={dimensions} setDimensions={setDimensions} assetTypes={assetTypes} assets={assets} strategy={strategy} />;
    if (activeSection === "liability_types") return <LiabilityTypeManager liabilityTypes={liabilityTypes} setLiabilityTypes={setLiabilityTypes} liabilities={liabilities} />;
    return <DataSettings driveConfigured={driveConfigured} driveAvailable={driveAvailable} onEditJson={onEditJson} />;
  }

  return (
    <div className="fixed inset-0 z-30 flex max-w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100" role="dialog" aria-modal="true" aria-label="Settings">
      <header className="shrink-0 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Settings</h1>
            <div className="text-xs text-zinc-500">{dirty ? <span className="text-amber-400">● Unsaved portfolio changes</span> : "No unsaved changes"}</div>
          </div>
          <button type="button" onClick={onDone} title="Done" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400">Done</button>
        </div>
      </header>

      <div className="shrink-0 border-b border-zinc-800 p-3 md:hidden">
        <label className="block text-sm">
          <span className="sr-only">Settings section</span>
          <select value={activeSection} onChange={(event) => setActiveSection(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            {sections.map((section) => <option key={section.key} value={section.key}>{section.label}{issueCounts[section.key] ? ` (${issueCounts[section.key]})` : ""}</option>)}
          </select>
        </label>
      </div>

      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1">
        <nav className="hidden w-60 shrink-0 overflow-y-auto border-r border-zinc-800 p-3 md:block" aria-label="Settings sections">
          {sections.map((section) => (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSection(section.key)}
              aria-current={activeSection === section.key ? "page" : undefined}
              className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeSection === section.key ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-900"}`}
            >
              <span>{section.label}</span>
              {!!issueCounts[section.key] && <span className="rounded-full bg-amber-500 px-1.5 text-[11px] font-medium text-zinc-950">{issueCounts[section.key]}</span>}
            </button>
          ))}
        </nav>
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto p-4 focus:outline-none md:p-6" tabIndex="-1">
          {content()}
        </main>
      </div>
    </div>
  );
}
