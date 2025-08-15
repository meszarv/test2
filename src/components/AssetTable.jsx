import React from "react";
import { formatCurrency } from "../utils.js";

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, readOnly = false, onEdit }) {
  const prevMap = new Map((prevAssets || []).map((a) => [a.name, Number(a.value) || 0]));

  function updateValue(id, value) {
    const val = Number(value || 0);
    setAssets(assets.map((a) => (a.id === id ? { ...a, value: val } : a)));
  }

  function remove(id) {
    if (readOnly) return;
    if (confirm("Remove asset?")) {
      setAssets(assets.filter((a) => a.id !== id));
    }
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Type</th>
            <th className="text-left p-2">Description</th>
            <th className="text-right p-2">Value</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => {
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
                <td className="p-2 text-right">
                  {!readOnly && (
                    <button
                      onClick={() => remove(a.id)}
                      title="Remove"
                      className="text-red-400 hover:text-red-300"
                    >
                      🗑️
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
