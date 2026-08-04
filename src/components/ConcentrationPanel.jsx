import React, { useMemo, useState } from "react";
import { concentrationRows, dimensionName, portfolioViews } from "../data.js";
import { formatCurrency } from "../utils.js";

function targetLabel(row, mode) {
  if (mode === "target") return row.target == null ? "—" : `${row.target.toFixed(1)}%`;
  if (mode === "limits") {
    if (row.min != null && row.max != null) return `${row.min}%–${row.max}%`;
    if (row.min != null) return `≥ ${row.min}%`;
    if (row.max != null) return `≤ ${row.max}%`;
  }
  return "—";
}

export default function ConcentrationPanel({ assets, assetTypes, dimensions, strategy, currency, selectedDimension, onSelectDimension, portfolioView = "total" }) {
  const [sort, setSort] = useState({ key: "amount", asc: false });
  const configuredPolicy = strategy.dimensionPolicies?.[selectedDimension] || { mode: "informational", categories: {} };
  const policy = portfolioView === "financial" ? configuredPolicy : { ...configuredPolicy, mode: "informational" };
  const rows = useMemo(() => {
    const result = concentrationRows(assets, selectedDimension, policy, assetTypes, dimensions, {}, portfolioView);
    result.sort((left, right) => {
      const a = left[sort.key];
      const b = right[sort.key];
      const comparison = typeof a === "string" ? a.localeCompare(b) : (a ?? -Infinity) - (b ?? -Infinity);
      return sort.asc ? comparison : -comparison;
    });
    return result;
  }, [assets, selectedDimension, policy, assetTypes, dimensions, portfolioView, sort]);

  function toggleSort(key) {
    setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true });
  }

  function heading(label, key, align = "left") {
    return (
      <th onClick={() => toggleSort(key)} className={`${align === "right" ? "text-right" : "text-left"} py-2 px-2 cursor-pointer whitespace-nowrap`}>
        {label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}
      </th>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="text-sm">
          <span className="text-zinc-400 mr-2">Dimension</span>
          <select
            value={selectedDimension}
            onChange={(event) => onSelectDimension(event.target.value)}
            className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2"
          >
            {["asset_type", ...Object.keys(dimensions)].map((key) => (
              <option key={key} value={key}>{dimensionName(key, dimensions)}</option>
            ))}
          </select>
        </label>
        <span className="text-xs text-zinc-500">
          {portfolioViews[portfolioView]?.name} · {portfolioView === "financial" ? `Strategy mode: ${policy.mode || "informational"}` : "Analysis only"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-zinc-400">
            <tr>
              {heading("Category", "label")}
              {heading("Amount", "amount", "right")}
              {heading("Current", "current", "right")}
              <th className="text-right py-2 px-2">Target / limit</th>
              {heading("Difference", "difference", "right")}
              {heading("Status", "status")}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category} className="border-t border-zinc-800">
                <td className="py-2 px-2">{row.label}</td>
                <td className="py-2 px-2 text-right">{formatCurrency(row.amount, currency)}</td>
                <td className="py-2 px-2 text-right">{row.current.toFixed(1)}%</td>
                <td className="py-2 px-2 text-right">{targetLabel(row, policy.mode)}</td>
                <td className={`py-2 px-2 text-right ${(row.difference || 0) > 0 ? "text-amber-400" : "text-zinc-300"}`}>
                  {row.difference == null ? "—" : `${row.difference > 0 ? "+" : ""}${row.difference.toFixed(1)} pp`}
                </td>
                <td className={`py-2 px-2 ${row.status === "On track" || row.status === "Informational" ? "text-emerald-400" : "text-amber-400"}`}>
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
