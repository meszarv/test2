import { formatCurrency, labelFor } from "../utils.js";

export default function RebalancePlan({ data }) {
  const cats = Object.keys(data.investPlan || {}).sort();
  if (cats.length === 0) return null;
  return (
    <div className="mt-4">
      <div className="text-sm text-zinc-400 mb-2">Now: <b className="text-zinc-200">{formatCurrency(data.totalNow)}</b> → Target: <b className="text-zinc-200">{formatCurrency(data.targetTotal)}</b></div>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left py-1">Category</th>
            <th className="text-right py-1">Current</th>
            <th className="text-right py-1">Ideal</th>
            <th className="text-right py-1">Invest now</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c} className="border-t border-zinc-800">
              <td className="py-1 text-zinc-200">{labelFor(c)}</td>
              <td className="py-1 text-right text-zinc-300">{formatCurrency(data.byCat[c] || 0)}</td>
              <td className="py-1 text-right text-zinc-300">{formatCurrency(data.idealByCat[c] || 0)}</td>
              <td className="py-1 text-right font-medium text-zinc-100">{formatCurrency(data.investPlan[c] || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
