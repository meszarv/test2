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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Checking-account cash</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.checkingCash, currency)}</div>
        </div>
        <div className="rounded-xl border border-zinc-800 p-3">
          <div className="text-xs text-zinc-500">Required cash reserve</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.effectiveReserveTarget, currency)}</div>
        </div>
        <div className={`rounded-xl border p-3 ${recommendation.reserveShortfall > 0.01 ? "border-amber-800 bg-amber-950/20" : "border-zinc-800"}`}>
          <div className="text-xs text-zinc-500">Reserve shortfall</div>
          <div className={`text-lg font-medium ${recommendation.reserveShortfall > 0.01 ? "text-amber-300" : ""}`}>{formatCurrency(recommendation.reserveShortfall, currency)}</div>
        </div>
        <div className={`rounded-xl border p-3 ${recommendation.availableToInvest > 0.01 ? "border-blue-700 bg-blue-950/20" : "border-zinc-800"}`}>
          <div className="text-xs text-zinc-500">Investment cash available</div>
          <div className="text-lg font-medium">{formatCurrency(recommendation.availableToInvest, currency)}</div>
        </div>
      </div>

      {(recommendation.warnings || []).map((warning) => (
        <div key={warning} className="rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-300">{warning}</div>
      ))}
      <p className="text-sm text-zinc-400">{recommendation.reason}</p>

      {recommendation.accountReserves.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Checking-account reserves</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="py-2 text-left">Account</th>
                  <th className="py-2 text-left">Assignment</th>
                  <th className="py-2 text-right">Current</th>
                  <th className="py-2 text-right">Reserve to keep</th>
                  <th className="py-2 text-right">After transfers</th>
                </tr>
              </thead>
              <tbody>
                {recommendation.accountReserves.map((account) => (
                  <tr key={account.assetId} className="border-t border-zinc-800">
                    <td className="py-2">{account.name}</td>
                    <td className="py-2 text-zinc-400">{account.assignment}</td>
                    <td className="py-2 text-right">{formatCurrency(account.current, currency)}</td>
                    <td className="py-2 text-right">{formatCurrency(account.reserve, currency)}</td>
                    <td className={`py-2 text-right ${account.projected + 0.01 < account.reserve ? "text-amber-300" : ""}`}>{formatCurrency(account.projected, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {recommendation.transfers.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Cash transfers — do these first</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-zinc-400">
                <tr>
                  <th className="py-2 text-left">From</th>
                  <th className="py-2 text-left">To</th>
                  <th className="py-2 text-left">Purpose</th>
                  <th className="py-2 text-right">Transfer</th>
                </tr>
              </thead>
              <tbody>
                {recommendation.transfers.map((transfer, index) => (
                  <tr key={`${transfer.fromAssetId}:${transfer.toAssetId}:${transfer.kind}:${index}`} className="border-t border-zinc-800">
                    <td className="py-2">{transfer.fromName}</td>
                    <td className="py-2">{transfer.toName}</td>
                    <td className="py-2 text-zinc-400">{transfer.kind === "replenish" ? "Replenish reserve" : "Fund investment cash"}</td>
                    <td className="py-2 text-right font-medium text-blue-300">{formatCurrency(transfer.amount, currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 p-3 text-sm">
        <div className="text-xs text-zinc-500">Financial Portfolio after plan</div>
        <div>{formatCurrency(recommendation.currentMetrics.financialPortfolio, currency)} → <span className="text-blue-300">{formatCurrency(recommendation.projectedMetrics.financialPortfolio, currency)}</span></div>
      </div>
      {recommendation.unallocated > 0.01 && (
        <div className="rounded-lg border border-blue-800 bg-blue-950/20 p-3 text-sm text-blue-200">
          {formatCurrency(recommendation.unallocated, currency)} remains in the investment cash account. Guidance retains cash whenever no eligible purchase would improve the configured strategy.
        </div>
      )}

      {recommendation.plan.length > 0 && (
        <>
          <h3 className="text-sm font-medium">Next investment</h3>
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
        </>
      )}

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

      {(recommendation.unresolvedRules || []).length > 0 && (
        <div className="rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-200">
          <p>{recommendation.unresolvedRules.length} configured strategy {recommendation.unresolvedRules.length === 1 ? "rule remains" : "rules remain"} outside target tolerance or limits after this buy-only plan. Existing positions, eligible destinations, or conflicting rules may prevent full compliance.</p>
          <ul className="mt-2 space-y-1 text-xs text-amber-100">
            {recommendation.unresolvedRules.map((rule) => (
              <li key={`${rule.key}:${rule.category}`}>
                {dimensionName(rule.key, dimensions)} · {rule.label}: {rule.status} at {rule.current.toFixed(1)}% ({rule.target != null
                  ? `target ${rule.target}%`
                  : [rule.min != null ? `minimum ${rule.min}%` : "", rule.max != null ? `maximum ${rule.max}%` : ""].filter(Boolean).join(", ")})
              </li>
            ))}
          </ul>
        </div>
      )}

      {(recommendation.transfers.length > 0 || recommendation.plan.length > 0) && (
        <p className="text-xs text-zinc-500">Advisory only. After executing the transfers and purchases, record the resulting balances and holdings in the next portfolio update.</p>
      )}
    </div>
  );
}
