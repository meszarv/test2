import React, { useState } from "react";
import { formatCurrency } from "../utils.js";

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, readOnly = false, onEdit }) {
  const [sort, setSort] = useState({ key: null, asc: true });
  const prevMap = new Map((prevAssets || []).map((a) => [a.name, Number(a.value) || 0]));

  function updateValue(id, value) {
    const val = Number(value || 0);
    setAssets(assets.map((a) => (a.id === id ? { ...a, value: val } : a)));
  }

  const sortedAssets = [...assets];
  if (sort.key) {
    sortedAssets.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "value") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (sort.key === "type") {
        av = assetTypes[av]?.name || av;
        bv = assetTypes[bv]?.name || bv;
      } else {
        av = (av || "").toString();
        bv = (bv || "").toString();
      }
      if (typeof av === "string") {
        return sort.asc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sort.asc ? av - bv : bv - av;
    });
  }

  const handleSort = (key) => {
    setSort((s) => (s.key === key ? { key, asc: !s.asc } : { key, asc: true }));
  };

  return (
    <>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("name")}>
              Name {sort.key === "name" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("type")}>
              Type {sort.key === "type" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-left p-2 cursor-pointer" onClick={() => handleSort("description")}>
              Description {sort.key === "description" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
            <th className="text-right p-2 cursor-pointer" onClick={() => handleSort("value") }>
              Value {sort.key === "value" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAssets.map((a) => {
            const prev = prevMap.get(a.name) || 0;
            const delta = (Number(a.value) || 0) - prev;
            return (
              <tr
                key={a.id}
                className="border-t border-zinc-800"
                onDoubleClick={() => !readOnly && onEdit && onEdit(a)}
              >
                <td className="p-2">{a.name}</td>
                <td className="p-2">{assetTypes[a.type]?.name || a.type}</td>
                <td className="p-2 text-xs whitespace-pre-line">{a.description}</td>
                <td className="p-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <input
                      type="number"
                      value={a.value}
                      onChange={(e) => updateValue(a.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="bg-transparent border border-transparent text-right px-1 py-1 rounded focus:bg-zinc-800 focus:border-blue-500 focus:outline-none w-32"
                      readOnly={readOnly}
                    />
                    {delta ? (
                      <span className={`text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ({formatCurrency(delta)})
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
