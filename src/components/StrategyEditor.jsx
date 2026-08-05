import { useMemo, useState } from "react";
import { currentByDimension, dimensionName, dimensionRegistry } from "../data.js";
import NumberInput, { MoneyInput, PercentageInput } from "./NumberInput.jsx";
import { CollapsiblePanel, SettingsSectionHeader, SettingsSummaryCard, SettingsValidation } from "./SettingsUI.jsx";

const importanceLabels = { 1: "Low", 2: "Medium", 3: "High" };
const modeLabels = {
  disabled: "Disabled",
  informational: "Informational",
  target: "Target allocation",
  limits: "Minimum / maximum",
};

function hasConfiguredValue(config = {}) {
  return ["target", "min", "max"].some((field) => Object.prototype.hasOwnProperty.call(config, field) && config[field] !== "" && config[field] != null);
}

export default function StrategyEditor({ strategy, setStrategy, assetTypes, dimensions, currency, assets = [] }) {
  const [openKey, setOpenKey] = useState("asset_type");
  const [rangeErrors, setRangeErrors] = useState({});

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

  function updateCategory(dimensionKey, category, field, value) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
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
    updatePolicy(dimensionKey, {
      categories: {
        ...categories,
        [category]: { ...categories[category], [field]: value },
      },
    });
  }

  const keys = ["asset_type", ...Object.keys(dimensions)];
  const summaries = useMemo(() => Object.fromEntries(keys.map((key) => {
    const policy = strategy.dimensionPolicies?.[key] || { mode: "informational", categories: {} };
    const total = Object.values(policy.categories || {}).reduce((sum, config) => sum + (Number(config.target) || 0), 0);
    const configuredCount = Object.values(policy.categories || {}).filter(hasConfiguredValue).length;
    return [key, {
      policy,
      total,
      configuredCount,
      invalid: policy.mode === "target" && Math.abs(total - 100) >= 0.01,
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
          <p className="mt-2 text-xs text-zinc-400">Checking-account cash above this amount becomes available for Financial Portfolio investments.</p>
        </div>
        <SettingsSummaryCard label="Configured dimensions" value={`${keys.length}`} description={`${issueCount} target validation issue${issueCount === 1 ? "" : "s"}`} tone={issueCount ? "warning" : "default"} />
      </div>

      {issueCount > 0 && <SettingsValidation>{issueCount} target allocation {issueCount === 1 ? "does" : "allocations do"} not total 100%.</SettingsValidation>}

      <div className="space-y-3">
        {keys.map((key) => {
          const { policy, total, configuredCount, invalid } = summaries[key];
          const registry = dimensionRegistry(key, assetTypes, dimensions);
          const categories = policy.categories || {};
          const categoryKeys = Array.from(new Set([...Object.keys(registry), ...Object.keys(categories)]));
          const currentAmounts = currentByDimension(assets, key, assetTypes, {}, "financial");
          const absentConfigured = categoryKeys.filter((category) => hasConfiguredValue(categories[category]) && !(Number(currentAmounts[category]) > 0));
          const importance = importanceLabels[policy.importance || 1];
          const summary = `${modeLabels[policy.mode] || "Informational"} · ${importance} importance · ${configuredCount} configured categor${configuredCount === 1 ? "y" : "ies"}`;
          const status = invalid
            ? <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-zinc-950">Total {total}%</span>
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
                    {categoryKeys.map((category) => {
                      const definition = registry[category];
                      const absent = hasConfiguredValue(categories[category]) && !(Number(currentAmounts[category]) > 0);
                      return (
                        <div key={category} className={`grid sm:grid-cols-[minmax(0,1fr)_8rem_8rem] gap-2 items-end rounded-lg px-3 py-2 ${absent ? "bg-amber-950/15" : "bg-zinc-950/30"}`}>
                          <div className="pb-2 text-sm text-zinc-300">
                            <div>{definition?.name || category}</div>
                            {absent && <div className="text-[11px] text-amber-400">Configured but absent from the Financial Portfolio</div>}
                          </div>
                          {policy.mode === "target" ? (
                            <>
                              <PercentageInput label="Target %" value={String(categories[category]?.target ?? 0)} onChange={(value) => updateCategory(key, category, "target", value)} />
                              <div />
                            </>
                          ) : (
                            <>
                              <PercentageInput label="Minimum %" value={String(categories[category]?.min ?? "")} required={false} onChange={(value) => updateCategory(key, category, "min", value)} externalError={rangeErrors[`${key}:${category}`] || ""} />
                              <PercentageInput label="Maximum %" value={String(categories[category]?.max ?? "")} required={false} onChange={(value) => updateCategory(key, category, "max", value)} />
                            </>
                          )}
                        </div>
                      );
                    })}
                    {policy.mode === "target" && (
                      <SettingsValidation valid={!invalid}>Total: {total}% {invalid ? "— targets must equal 100%." : "— allocation is valid."}</SettingsValidation>
                    )}
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
