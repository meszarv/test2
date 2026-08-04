import { concentrationRows, dimensionName } from "../data.js";
import { formatCurrency } from "../utils.js";

function strategyEffects(assets, recommendation, strategy, assetTypes, dimensions) {
  const effects = [];
  for (const [key, policy] of Object.entries(strategy.dimensionPolicies || {})) {
    if (policy.mode !== "target" && policy.mode !== "limits") continue;
    const current = concentrationRows(assets, key, policy, assetTypes, dimensions, recommendation.currentValues, "financial");
    const projected = concentrationRows(assets, key, policy, assetTypes, dimensions, recommendation.projectedValues, "financial");
    const projectedMap = new Map(projected.map((row) => [row.category, row]));
    for (const row of current) {
      const next = projectedMap.get(row.category);
      if (!next || Math.abs(next.current - row.current) < 0.01) continue;
      effects.push({
        key: `${key}:${row.category}`,
        dimension: dimensionName(key, dimensions),
        category: row.label,
        current: row.current,
        projected: next.current,
        target: row.target,
        min: row.min,
        max: row.max,
      });
    }
  }
  return effects;
}

export default function SurplusPlan({ recommendation, assets, strategy, assetTypes, dimensions, currency }) {
  const effects = strategyEffects(assets, recommendation, strategy, assetTypes, dimensions);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Checking-account cash</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.checkingCash, currency)}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Cash reserve</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.reserveTarget, currency)}</div>
        </div>
        <div className={`rounded-xl border p-3 ${recommendation.surplus > 0 ? "border-blue-700 bg-blue-950/20" : "border-zinc-800"}`}>
          <div className="text-xs text-zinc-500">Available to invest</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.surplus, currency)}</div>
        </div>
      </div>

      <p className="text-sm text-zinc-400">{recommendation.reason}</p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Financial Portfolio after plan</div>
          <div>{formatCurrency(recommendation.currentMetrics.financialPortfolio, currency)} → <span className="text-blue-300">{formatCurrency(recommendation.projectedMetrics.financialPortfolio, currency)}</span></div>
        </div>
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Investable Assets after transfer</div>
          <div>{formatCurrency(recommendation.currentMetrics.investableAssets, currency)} → {formatCurrency(recommendation.projectedMetrics.investableAssets, currency)}</div>
        </div>
      </div>
      {recommendation.unallocated > 0.01 && (
        <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-300">
          {formatCurrency(recommendation.unallocated, currency)} remains in checking accounts because every further allocation would break a configured maximum.
        </div>
      )}

      {recommendation.plan.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="text-left py-2">Investment</th>
                  <th className="text-right py-2">Current</th>
                  <th className="text-right py-2">Invest</th>
                  <th className="text-right py-2">Projected</th>
                </tr>
              </thead>
              <tbody>
                {recommendation.plan.map((item) => (
                  <tr key={item.assetId} className="border-t border-zinc-800">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2 text-right">{formatCurrency(recommendation.currentValues[item.assetId] || 0, currency)}</td>
                    <td className="py-2 text-right font-medium text-blue-300">{formatCurrency(item.amount, currency)}</td>
                    <td className="py-2 text-right">{formatCurrency(recommendation.projectedValues[item.assetId] || 0, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {effects.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Projected strategy effect</h3>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead className="text-zinc-500">
                    <tr>
                      <th className="text-left py-1">Dimension</th>
                      <th className="text-left py-1">Category</th>
                      <th className="text-right py-1">Current</th>
                      <th className="text-right py-1">Projected</th>
                      <th className="text-right py-1">Target / limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {effects.map((effect) => (
                      <tr key={effect.key} className="border-t border-zinc-800">
                        <td className="py-1">{effect.dimension}</td>
                        <td className="py-1">{effect.category}</td>
                        <td className="py-1 text-right">{effect.current.toFixed(1)}%</td>
                        <td className="py-1 text-right">{effect.projected.toFixed(1)}%</td>
                        <td className="py-1 text-right">
                          {effect.target != null ? `${effect.target}%` : `${effect.min ?? "—"}%–${effect.max ?? "—"}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="text-xs text-zinc-500">Advisory only. Record the actual purchase in the portfolio after executing it with your provider.</p>
        </>
      )}
    </div>
  );
}
