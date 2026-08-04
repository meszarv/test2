import { dimensionName, dimensionRegistry } from "../data.js";
import TextInput from "./TextInput.jsx";

export default function StrategyEditor({ strategy, setStrategy, assetTypes, dimensions, currency }) {
  function setCashReserveTarget(value) {
    setStrategy({ ...strategy, cashReserveTarget: Number(value) || 0 });
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
    updatePolicy(dimensionKey, {
      categories: {
        ...categories,
        [category]: { ...categories[category], [field]: value === "" ? "" : Number(value) || 0 },
      },
    });
  }

  const keys = ["asset_type", ...Object.keys(dimensions)];

  return (
    <div className="space-y-4">
      <div className="border border-blue-900/70 bg-blue-950/20 rounded-xl p-4 space-y-2">
        <TextInput
          label={`Cash reserve across checking accounts (${currency})`}
          type="number"
          value={String(strategy.cashReserveTarget || 0)}
          onChange={setCashReserveTarget}
        />
        <p className="text-xs text-zinc-400">Checking-account cash above this amount becomes the investable surplus.</p>
      </div>

      {keys.map((key) => {
        const policy = strategy.dimensionPolicies?.[key] || { mode: "informational", categories: {} };
        const registry = dimensionRegistry(key, assetTypes, dimensions);
        const total = Object.keys(registry).reduce((sum, category) => sum + (Number(policy.categories?.[category]?.target) || 0), 0);
        return (
          <div key={key} className="border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="grid md:grid-cols-[1fr_12rem_7rem_7rem] items-end gap-3">
              <div>
                <h3 className="font-medium">{dimensionName(key, dimensions)}</h3>
                <p className="text-xs text-zinc-500">Controls analysis and the surplus-cash recommendation.</p>
              </div>
              <label className="block text-sm">
                <span className="text-zinc-400">Mode</span>
                <select
                  value={policy.mode || "informational"}
                  onChange={(event) => updatePolicy(key, { mode: event.target.value })}
                  className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2"
                >
                  <option value="disabled">Disabled</option>
                  <option value="informational">Informational</option>
                  <option value="target">Target allocation</option>
                  <option value="limits">Minimum / maximum</option>
                </select>
              </label>
              <TextInput
                label="Tolerance pp"
                type="number"
                value={String(policy.tolerance ?? 2)}
                onChange={(value) => updatePolicy(key, { tolerance: Number(value) || 0 })}
                disabled={policy.mode !== "target"}
              />
              <label className="block text-sm">
                <span className="text-zinc-400">Importance</span>
                <select
                  value={String(policy.importance || 1)}
                  onChange={(event) => updatePolicy(key, { importance: Number(event.target.value) })}
                  disabled={policy.mode !== "target" && policy.mode !== "limits"}
                  className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 disabled:opacity-50"
                >
                  <option value="1">Low</option>
                  <option value="2">Medium</option>
                  <option value="3">High</option>
                </select>
              </label>
            </div>

            {(policy.mode === "target" || policy.mode === "limits") && (
              <div className="space-y-2">
                {Object.entries(registry).map(([category, definition]) => (
                  <div key={category} className="grid grid-cols-[1fr_repeat(2,minmax(6rem,8rem))] gap-2 items-end">
                    <div className="text-sm text-zinc-300 pb-2">{definition.name}</div>
                    {policy.mode === "target" ? (
                      <>
                        <TextInput
                          label="Target %"
                          type="number"
                          value={String(policy.categories?.[category]?.target ?? 0)}
                          onChange={(value) => updateCategory(key, category, "target", value)}
                        />
                        <div />
                      </>
                    ) : (
                      <>
                        <TextInput
                          label="Minimum %"
                          type="number"
                          value={String(policy.categories?.[category]?.min ?? "")}
                          onChange={(value) => updateCategory(key, category, "min", value)}
                        />
                        <TextInput
                          label="Maximum %"
                          type="number"
                          value={String(policy.categories?.[category]?.max ?? "")}
                          onChange={(value) => updateCategory(key, category, "max", value)}
                        />
                      </>
                    )}
                  </div>
                ))}
                {policy.mode === "target" && (
                  <div className={`text-right text-xs ${Math.abs(total - 100) < 0.01 ? "text-emerald-400" : "text-amber-400"}`}>
                    Total: {total}% {Math.abs(total - 100) >= 0.01 && "(must equal 100%)"}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
