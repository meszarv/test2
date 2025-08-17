import React, { useState } from "react";
import { formatCurrency, labelFor, pieColors } from "../utils.js";

export default function RebalancePlan({ data, assetTypes }) {
  const [sort, setSort] = useState({ key: "category", asc: true });
  const cats = Array.from(
    new Set([
      ...Object.keys(data.byCat || {}),
      ...Object.keys(data.idealByCat || {}),
      ...Object.keys(data.investPlan || {}),
    ])
  );
  if (data.priorityDebt != null) cats.push("priority_debt");
  cats.sort((a, b) => {
    let av;
    let bv;
    switch (sort.key) {
      case "current":
        av = a === "priority_debt" ? -(data.priorityDebt || 0) : data.byCat[a] || 0;
        bv = b === "priority_debt" ? -(data.priorityDebt || 0) : data.byCat[b] || 0;
        break;
      case "ideal":
        av = a === "priority_debt" ? 0 : data.idealByCat[a] || 0;
        bv = b === "priority_debt" ? 0 : data.idealByCat[b] || 0;
        break;
      case "invest":
        av = a === "priority_debt" ? 0 : data.investPlan[a] || 0;
        bv = b === "priority_debt" ? 0 : data.investPlan[b] || 0;
        break;
      default:
        av = a === "priority_debt" ? "Priority debt" : labelFor(a, assetTypes);
        bv = b === "priority_debt" ? "Priority debt" : labelFor(b, assetTypes);
    }
    if (typeof av === "string") {
      const cmp = av.localeCompare(bv);
      return sort.asc ? cmp : -cmp;
    }
    return sort.asc ? av - bv : bv - av;
  });
  if (cats.length === 0) return null;
  const colorMap = {};
  Object.keys(data.byCat || {}).forEach((c, i) => {
    colorMap[c] = pieColors[i % pieColors.length];
  });
  if (data.priorityDebt != null) colorMap["priority_debt"] = "#ef4444";
  const handleSort = (key) => {
    setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true }));
  };
  return (
    <div className="mt-4">
      <div className="text-sm text-zinc-400 mb-2">Now: <b className="text-zinc-200">{formatCurrency(data.totalNow)}</b> → Target: <b className="text-zinc-200">{formatCurrency(data.targetTotal)}</b></div>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left py-1"></th>
            <th className="text-left py-1 cursor-pointer" onClick={() => handleSort("category")}>
              Category {sort.key === "category" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-right py-1 cursor-pointer" onClick={() => handleSort("current")}>
              Current {sort.key === "current" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-right py-1 cursor-pointer" onClick={() => handleSort("ideal")}>
              Ideal {sort.key === "ideal" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-right py-1 cursor-pointer" onClick={() => handleSort("invest")}>
              Invest now {sort.key === "invest" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {cats.map((c) => (
            <tr key={c} className="border-t border-zinc-800">
              <td className="py-1">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: colorMap[c] }}></span>
              </td>
              <td className="py-1 text-zinc-200">
                {c === "priority_debt" ? "Priority debt" : labelFor(c, assetTypes)}
              </td>
              <td className="py-1 text-right text-zinc-300">
                {formatCurrency(c === "priority_debt" ? -(data.priorityDebt || 0) : data.byCat[c] || 0)}
              </td>
              <td className="py-1 text-right text-zinc-300">
                {formatCurrency(c === "priority_debt" ? 0 : data.idealByCat[c] || 0)}
              </td>
              <td className="py-1 text-right font-medium text-zinc-100">
                {formatCurrency(c === "priority_debt" ? 0 : data.investPlan[c] || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
