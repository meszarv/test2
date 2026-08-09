import React, { useMemo, useState } from "react";
import { concentrationRows, currentByDimension, dimensionName, dimensionRegistry, portfolioViews } from "../data.js";
import { formatCurrency } from "../utils.js";
import PieChart from "./PieChart.jsx";

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
  const dimensionKeys = useMemo(() => ["asset_type", ...Object.keys(dimensions)], [dimensions]);
  const chartData = useMemo(() => Object.fromEntries(dimensionKeys.map((key) => [
    key,
    currentByDimension(assets, key, assetTypes, {}, portfolioView),
  ])), [assets, assetTypes, dimensionKeys, portfolioView]);
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
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Concentration overview</h3>
          <p className="mt-1 text-xs text-zinc-500">All dimensions for {portfolioViews[portfolioView]?.name}. Select a chart to inspect its exact values below.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dimensionKeys.map((key) => {
            const name = dimensionName(key, dimensions);
            const data = chartData[key] || {};
            const hasData = Object.values(data).some((value) => Number(value) > 0);
            const selected = selectedDimension === key;
            return (
              <article
                key={key}
                data-concentration-chart={key}
                className={`min-w-0 rounded-xl border bg-zinc-950/30 p-3 ${selected ? "border-blue-500 ring-1 ring-blue-500/60" : "border-zinc-800"}`}
              >
                <button
                  type="button"
                  aria-label={`Show ${name} details`}
                  aria-pressed={selected}
                  onClick={() => onSelectDimension(key)}
                  className="mb-2 flex w-full items-center justify-between gap-2 rounded text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="text-sm font-medium text-zinc-200">{name}</span>
                  <span className={`text-[11px] ${selected ? "text-blue-300" : "text-zinc-500"}`}>{selected ? "Selected" : "View details"}</span>
                </button>
                {hasData ? (
                  <div onClick={() => onSelectDimension(key)} className="cursor-pointer">
                    <PieChart
                      data={data}
                      assetTypes={dimensionRegistry(key, assetTypes, dimensions)}
                      compact
                      ariaLabel={`${name} concentration pie chart`}
                    />
                  </div>
                ) : (
                  <div className="grid h-32 place-items-center rounded border border-dashed border-zinc-800 text-xs text-zinc-500">No assets in this view</div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 border-t border-zinc-800 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-zinc-200">Detailed breakdown</h3>
            <p className="mt-1 text-xs text-zinc-500">Exact amounts, percentages, and configured strategy comparison.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm">
              <span className="text-zinc-400 mr-2">Dimension</span>
              <select
                value={selectedDimension}
                onChange={(event) => onSelectDimension(event.target.value)}
                className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2"
              >
                {dimensionKeys.map((key) => (
                  <option key={key} value={key}>{dimensionName(key, dimensions)}</option>
                ))}
              </select>
            </label>
            <span className="text-xs text-zinc-500">
              {portfolioViews[portfolioView]?.name} · {portfolioView === "financial" ? `Strategy mode: ${policy.mode || "informational"}` : "Analysis only"}
            </span>
          </div>
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
    </div>
  );
}
