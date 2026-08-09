import { useMemo, useState } from "react";
import { currentByDimension, dimensionName, dimensionRegistry } from "../data.js";
import { colorForCategory } from "../utils.js";
import NumberInput, { MoneyInput, PercentageInput } from "./NumberInput.jsx";
import { CollapsiblePanel, SettingsSectionHeader, SettingsSummaryCard, SettingsValidation } from "./SettingsUI.jsx";
import TargetAllocationBar, {
  addTargetAllocation,
  normalizeTargetAllocations,
  removeTargetAllocation,
  setTargetAllocation,
} from "./TargetAllocationBar.jsx";

const importanceLabels = { 1: "Low", 2: "Medium", 3: "High" };
const modeLabels = {
  disabled: "Disabled",
  informational: "Informational",
  target: "Target allocation",
  limits: "Minimum / maximum",
};

function hasValue(value) {
  return value !== "" && value != null;
}

export function categoryConfiguredForMode(config = {}, mode) {
  if (mode === "target") return hasValue(config.target) && Number(config.target) > 0;
  if (mode === "limits") return hasValue(config.min) || hasValue(config.max);
  return false;
}

export default function StrategyEditor({ strategy, setStrategy, assetTypes, dimensions, currency, assets = [] }) {
  const [openKey, setOpenKey] = useState("asset_type");
  const [rangeErrors, setRangeErrors] = useState({});
  const [pendingCategories, setPendingCategories] = useState({});
  const [categorySelections, setCategorySelections] = useState({});

  function setCashReserveTarget(value) {
    setStrategy({ ...strategy, cashReserveTarget: value });
  }

  function updatePolicy(key, patch) {
    const current = strategy.dimensionPolicies?.[key] || {};
    setStrategy({
      ...strategy,
      dimensionPolicies: {
        ...strategy.dimensionPolicies,
        [key]: { ...current, ...patch },
      },
    });
  }

  function currentTargetAllocations(categories = {}) {
    return Object.fromEntries(
      Object.entries(categories)
        .filter(([, config]) => categoryConfiguredForMode(config, "target"))
        .map(([category, config]) => [category, Number(config.target)]),
    );
  }

  function updateTargetAllocations(dimensionKey, allocations) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    const nextCategories = { ...categories };
    for (const [category, config] of Object.entries(categories)) {
      if (!Object.prototype.hasOwnProperty.call(config, "target") || Object.prototype.hasOwnProperty.call(allocations, category)) continue;
      const nextConfig = { ...config };
      delete nextConfig.target;
      if (Object.keys(nextConfig).length > 0) nextCategories[category] = nextConfig;
      else delete nextCategories[category];
    }
    for (const [category, target] of Object.entries(allocations)) {
      nextCategories[category] = { ...(nextCategories[category] || {}), target };
    }
    updatePolicy(dimensionKey, { categories: nextCategories });
  }

  function pendingKey(dimensionKey, mode) {
    return `${dimensionKey}:${mode}`;
  }

  function removePendingCategory(dimensionKey, mode, category) {
    const key = pendingKey(dimensionKey, mode);
    setPendingCategories((pending) => ({
      ...pending,
      [key]: (pending[key] || []).filter((item) => item !== category),
    }));
  }

  function removeCategoryRule(dimensionKey, category, mode) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    if (mode === "target") {
      const targets = currentTargetAllocations(categories);
      if (Object.keys(targets).length <= 1) return;
      updateTargetAllocations(dimensionKey, removeTargetAllocation(targets, category));
      removePendingCategory(dimensionKey, mode, category);
      return;
    }
    const current = { ...(categories[category] || {}) };
    if (mode === "limits") {
      delete current.min;
      delete current.max;
    }
    const nextCategories = { ...categories };
    if (Object.keys(current).length > 0) nextCategories[category] = current;
    else delete nextCategories[category];
    updatePolicy(dimensionKey, { categories: nextCategories });
    removePendingCategory(dimensionKey, mode, category);
    setRangeErrors((errors) => {
      const errorKey = `${dimensionKey}:${category}`;
      if (!errors[errorKey]) return errors;
      const next = { ...errors };
      delete next[errorKey];
      return next;
    });
  }

  function addCategoryRule(dimensionKey, mode, category) {
    if (!category) return;
    if (mode === "target") {
      const categories = strategy.dimensionPolicies?.[dimensionKey]?.categories || {};
      updateTargetAllocations(dimensionKey, addTargetAllocation(currentTargetAllocations(categories), category));
      removePendingCategory(dimensionKey, mode, category);
      return;
    }
    const key = pendingKey(dimensionKey, mode);
    setPendingCategories((pending) => ({
      ...pending,
      [key]: Array.from(new Set([...(pending[key] || []), category])),
    }));
  }

  function updateCategory(dimensionKey, category, field, value) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    if (policy.mode === "target" && field === "target") {
      updateTargetAllocations(dimensionKey, setTargetAllocation(currentTargetAllocations(categories), category, value));
      removePendingCategory(dimensionKey, policy.mode, category);
      return;
    }
    const current = categories[category] || {};
    const nextMinimum = field === "min" ? value : current.min;
    const nextMaximum = field === "max" ? value : current.max;
    const errorKey = `${dimensionKey}:${category}`;
    if (nextMinimum !== "" && nextMinimum != null && nextMaximum !== "" && nextMaximum != null && Number(nextMinimum) > Number(nextMaximum)) {
      setRangeErrors((errors) => ({ ...errors, [errorKey]: "Minimum cannot exceed maximum." }));
      return;
    }
    setRangeErrors((errors) => {
      if (!errors[errorKey]) return errors;
      const next = { ...errors };
      delete next[errorKey];
      return next;
    });
    if (policy.mode === "limits" && !hasValue(nextMinimum) && !hasValue(nextMaximum)) {
      removeCategoryRule(dimensionKey, category, policy.mode);
      return;
    }
    updatePolicy(dimensionKey, {
      categories: {
        ...categories,
        [category]: { ...categories[category], [field]: value },
      },
    });
    removePendingCategory(dimensionKey, policy.mode, category);
  }

  const keys = ["asset_type", ...Object.keys(dimensions)];
  const summaries = useMemo(() => Object.fromEntries(keys.map((key) => {
    const policy = strategy.dimensionPolicies?.[key] || { mode: "informational", categories: {} };
    const total = Object.values(policy.categories || {}).reduce((sum, config) => sum + (Number(config.target) > 0 ? Number(config.target) : 0), 0);
    const configuredCount = Object.values(policy.categories || {}).filter((config) => categoryConfiguredForMode(config, policy.mode)).length;
    const hasFractionalTargets = Object.values(policy.categories || {}).some((config) => Number(config.target) > 0 && !Number.isInteger(Number(config.target)));
    return [key, {
      policy,
      total,
      configuredCount,
      hasFractionalTargets,
      invalid: policy.mode === "target" && (Math.abs(total - 100) >= 0.01 || hasFractionalTargets),
    }];
  })), [keys.join("|"), strategy]);
  const issueCount = Object.values(summaries).filter((summary) => summary.invalid).length;

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Strategy"
        description="Targets, limits, and surplus-cash recommendations are evaluated against the Financial Portfolio."
        right={issueCount > 0 ? <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-zinc-950">{issueCount} issue{issueCount === 1 ? "" : "s"}</span> : null}
      />

      <div className="grid md:grid-cols-[minmax(0,1fr)_14rem] gap-3">
        <div className="rounded-xl border border-blue-900/70 bg-blue-950/20 p-4">
          <MoneyInput
            label={`Checking-account cash reserve (${currency})`}
            value={String(strategy.cashReserveTarget || 0)}
            onChange={setCashReserveTarget}
            currency={currency}
          />
          <p className="mt-2 text-xs text-zinc-400">Explicit account reserves are assigned first. Checking accounts left automatic divide the remaining amount equally.</p>
        </div>
        <SettingsSummaryCard label="Configured dimensions" value={`${keys.length}`} description={`${issueCount} target validation issue${issueCount === 1 ? "" : "s"}`} tone={issueCount ? "warning" : "default"} />
      </div>

      {issueCount > 0 && <SettingsValidation>{issueCount} target allocation {issueCount === 1 ? "requires" : "require"} normalization to whole percentages totaling 100%.</SettingsValidation>}

      <div className="space-y-3">
        {keys.map((key) => {
          const { policy, total, configuredCount, hasFractionalTargets, invalid } = summaries[key];
          const registry = dimensionRegistry(key, assetTypes, dimensions);
          const categories = policy.categories || {};
          const currentAmounts = currentByDimension(assets, key, assetTypes, {}, "financial");
          const mode = policy.mode || "informational";
          const ruleKey = pendingKey(key, mode);
          const configuredCategoryKeys = Object.keys(categories).filter((category) => categoryConfiguredForMode(categories[category], mode));
          const renderedCategoryKeys = Array.from(new Set([...configuredCategoryKeys, ...(pendingCategories[ruleKey] || [])]));
          const categoryKeys = Array.from(new Set([...Object.keys(registry), ...Object.keys(currentAmounts), ...Object.keys(categories)]));
          const availableCategoryKeys = categoryKeys.filter((category) => !renderedCategoryKeys.includes(category));
          const selectedCategory = availableCategoryKeys.includes(categorySelections[ruleKey]) ? categorySelections[ruleKey] : availableCategoryKeys[0] || "";
          const absentConfigured = configuredCategoryKeys.filter((category) => !(Number(currentAmounts[category]) > 0));
          const targetAllocations = currentTargetAllocations(categories);
          const importance = importanceLabels[policy.importance || 1];
          const summary = `${modeLabels[policy.mode] || "Informational"} · ${importance} importance · ${configuredCount} configured categor${configuredCount === 1 ? "y" : "ies"}`;
          const status = invalid
            ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-zinc-950">{hasFractionalTargets && Math.abs(total - 100) < 0.01 ? "Round values" : `Total ${total}%`}</span>
            : policy.mode === "target"
            ? <span className="text-xs text-emerald-400">100%</span>
            : null;
          return (
            <CollapsiblePanel
              key={key}
              title={dimensionName(key, dimensions)}
              summary={summary}
              status={status}
              open={openKey === key}
              onToggle={() => setOpenKey((current) => current === key ? "" : key)}
            >
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="block text-sm">
                    <span className="text-zinc-400">Mode</span>
                    <select
                      value={policy.mode || "informational"}
                      onChange={(event) => updatePolicy(key, { mode: event.target.value })}
                      className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="disabled">Disabled</option>
                      <option value="informational">Informational</option>
                      <option value="target">Target allocation</option>
                      <option value="limits">Minimum / maximum</option>
                    </select>
                  </label>
                  <NumberInput
                    label="Tolerance pp"
                    value={String(policy.tolerance ?? 2)}
                    min={0}
                    max={100}
                    precision={2}
                    onChange={(value) => updatePolicy(key, { tolerance: value })}
                    disabled={policy.mode !== "target"}
                  />
                  <label className="block text-sm">
                    <span className="text-zinc-400">Importance</span>
                    <select
                      value={String(policy.importance || 1)}
                      onChange={(event) => updatePolicy(key, { importance: Number(event.target.value) })}
                      disabled={policy.mode !== "target" && policy.mode !== "limits"}
                      className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Low</option>
                      <option value="2">Medium</option>
                      <option value="3">High</option>
                    </select>
                  </label>
                </div>

                {(policy.mode === "target" || policy.mode === "limits") && (
                  <div className="space-y-2">
                    <div className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3 xl:flex-row xl:items-end xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-zinc-200">{policy.mode === "target" ? "Target categories" : "Allocation limits"}</h4>
                        <p className="mt-1 text-xs text-zinc-500">
                          {policy.mode === "target"
                            ? "Targets always total 100%. Adding, removing, dragging, or editing a value automatically rebalances the other categories."
                            : "Only configured limits are listed. Unlisted categories have no minimum or maximum."}
                        </p>
                      </div>
                      <div className="flex min-w-0 w-full items-end gap-2 xl:w-auto">
                        <label className="min-w-0 flex-1 text-sm xl:w-52 xl:flex-none">
                          <span className="text-zinc-400">Category to add</span>
                          <select
                            aria-label={`${dimensionName(key, dimensions)} category to add`}
                            value={selectedCategory}
                            onChange={(event) => setCategorySelections((selections) => ({ ...selections, [ruleKey]: event.target.value }))}
                            disabled={availableCategoryKeys.length === 0}
                            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {availableCategoryKeys.length === 0 ? <option value="">All categories added</option> : availableCategoryKeys.map((category) => (
                              <option key={category} value={category}>{registry[category]?.name || category}</option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          aria-label={`Add ${dimensionName(key, dimensions)} category`}
                          onClick={() => addCategoryRule(key, policy.mode, selectedCategory)}
                          disabled={!selectedCategory}
                          className="h-[42px] whitespace-nowrap rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span aria-hidden="true" className="mr-1 text-lg leading-none">+</span> Add category
                        </button>
                      </div>
                    </div>
                    {policy.mode === "target" && configuredCategoryKeys.length > 0 && !invalid && (
                      <TargetAllocationBar
                        allocations={targetAllocations}
                        labels={registry}
                        ariaLabel={`${dimensionName(key, dimensions)} target allocation`}
                        onChange={(allocations) => updateTargetAllocations(key, allocations)}
                      />
                    )}
                    {policy.mode === "target" && configuredCategoryKeys.length > 0 && invalid && (
                      <SettingsValidation>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span>{Math.abs(total - 100) >= 0.01 ? `Existing targets total ${total}%.` : "Existing targets use decimal percentages."} Convert them to whole percentages before using the visual allocation bar.</span>
                          <button
                            type="button"
                            onClick={() => updateTargetAllocations(key, normalizeTargetAllocations(targetAllocations))}
                            className="rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-200"
                          >
                            {hasFractionalTargets ? "Round to whole %" : "Normalize to 100%"}
                          </button>
                        </div>
                      </SettingsValidation>
                    )}
                    {renderedCategoryKeys.length === 0 && (
                      <div className="rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-sm text-zinc-500">
                        No {policy.mode === "target" ? "target categories" : "allocation limits"} configured.{policy.mode === "target" ? " Add the first category to assign it 100%." : ""}
                      </div>
                    )}
                    {renderedCategoryKeys.map((category) => {
                      const definition = registry[category];
                      const absent = !(Number(currentAmounts[category]) > 0);
                      const configured = categoryConfiguredForMode(categories[category], policy.mode);
                      return (
                        <div
                          key={category}
                          data-category-rule={category}
                          className={`grid gap-2 items-end rounded-lg px-3 py-2 ${policy.mode === "target" ? "sm:grid-cols-[minmax(0,1fr)_8rem_2.5rem]" : "sm:grid-cols-[minmax(0,1fr)_8rem_8rem_2.5rem]"} ${absent ? "bg-amber-950/15" : "bg-zinc-950/30"}`}
                        >
                          <div className="pb-2 text-sm text-zinc-300">
                            <div className="flex items-center gap-2">
                              {policy.mode === "target" && <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: colorForCategory(category) }} />}
                              <span>{definition?.name || category}</span>
                            </div>
                            {absent && <div className="text-[11px] text-amber-400">{configured ? "Configured but absent from the Financial Portfolio" : "Not currently present in the Financial Portfolio"}</div>}
                          </div>
                          {policy.mode === "target" ? (
                            <PercentageInput
                              label="Target %"
                              value={String(categories[category]?.target ?? "")}
                              min={configuredCategoryKeys.length > 1 ? 1 : 100}
                              max={configuredCategoryKeys.length > 1 ? 100 - (configuredCategoryKeys.length - 1) : 100}
                              precision={0}
                              disabled={configuredCategoryKeys.length === 1}
                              onChange={(value) => updateCategory(key, category, "target", value)}
                            />
                          ) : (
                            <>
                              <PercentageInput label="Minimum %" value={String(categories[category]?.min ?? "")} required={false} onChange={(value) => updateCategory(key, category, "min", value)} externalError={rangeErrors[`${key}:${category}`] || ""} />
                              <PercentageInput label="Maximum %" value={String(categories[category]?.max ?? "")} required={false} onChange={(value) => updateCategory(key, category, "max", value)} />
                            </>
                          )}
                          <button
                            type="button"
                            aria-label={`Remove ${definition?.name || category} ${policy.mode === "target" ? "target" : "limits"}`}
                            title="Remove rule"
                            onClick={() => removeCategoryRule(key, category, policy.mode)}
                            disabled={policy.mode === "target" && configuredCategoryKeys.length <= 1}
                            className="mb-0.5 grid h-10 w-10 place-items-center rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-35"
                          >
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                    {absentConfigured.length > 0 && <p className="text-xs text-zinc-500">Saved settings for absent categories are retained so they are available if matching Financial assets are added later.</p>}
                  </div>
                )}
              </div>
            </CollapsiblePanel>
          );
        })}
      </div>
    </div>
  );
}
