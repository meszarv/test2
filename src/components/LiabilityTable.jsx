import React, { useState } from "react";
import { formatCurrency } from "../utils.js";

export default function LiabilityTable({ liabilities, prevLiabilities, setLiabilities, liabilityTypes, readOnly = false, onEdit }) {
  const [sort, setSort] = useState({ key: null, asc: true });
  const prevMap = new Map((prevLiabilities || []).map((l) => [l.id, Number(l.value) || 0]));

  function updateValue(id, value) {
    const val = Number(value || 0);
    setLiabilities(liabilities.map((l) => (l.id === id ? { ...l, value: val } : l)));
  }

  const sortedLiabilities = [...liabilities];
  if (sort.key) {
    sortedLiabilities.sort((a, b) => {
      let av = a[sort.key];
      let bv = b[sort.key];
      if (sort.key === "value") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (sort.key === "type") {
        av = liabilityTypes[av]?.name || av;
        bv = liabilityTypes[bv]?.name || bv;
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
            <th className="text-right p-2 cursor-pointer" onClick={() => handleSort("value")}>
              Value {sort.key === "value" ? (sort.asc ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedLiabilities.map((l) => {
            const prev = prevMap.get(l.id) || 0;
            const delta = (Number(l.value) || 0) - prev;
            return (
              <tr
                key={l.id}
                className="border-t border-zinc-800"
                onDoubleClick={() => !readOnly && onEdit && onEdit(l)}
              >
                <td className="p-2">{l.name}</td>
                <td className="p-2">{liabilityTypes[l.type]?.name || l.type}</td>
                <td className="p-2 text-xs whitespace-pre-line">{l.description}</td>
                <td className="p-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative w-32">
                      <input
                        type="number"
                        value={l.value}
                        onChange={(e) => updateValue(l.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="peer bg-transparent border border-transparent text-right px-1 py-1 rounded focus:bg-zinc-800 focus:border-blue-500 focus:outline-none w-full text-transparent focus:text-inherit"
                        readOnly={readOnly}
                      />
                      <span
                        className={`pointer-events-none absolute inset-0 flex items-center justify-end px-1 ${readOnly ? "" : "peer-focus:hidden"}`}
                      >
                        {formatCurrency(l.value)}
                      </span>
                    </div>
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
