import React, { useState } from "react";
import { formatCurrency } from "../utils.js";

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, readOnly = false }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");

  const prevMap = new Map((prevAssets || []).map((a) => [a.name, Number(a.value) || 0]));

  function startEdit(asset) {
    if (readOnly) return;
    setEditingId(asset.id);
    setDraft(String(asset.value));
  }

  function commit(id) {
    const val = Number(draft || 0);
    setAssets(assets.map((a) => (a.id === id ? { ...a, value: val } : a)));
    setEditingId(null);
  }

  function handleKey(e, id) {
    if (e.key === "Enter") commit(id);
    if (e.key === "Escape") setEditingId(null);
  }

  function remove(id) {
    if (readOnly) return;
    if (confirm("Remove asset?")) {
      setAssets(assets.filter((a) => a.id !== id));
    }
  }

  return (
    <table className="w-full text-sm">
      <thead className="text-zinc-400">
        <tr>
          <th className="text-left p-2">Name</th>
          <th className="text-left p-2">Class</th>
          <th className="text-right p-2">Prev</th>
          <th className="text-right p-2">Value</th>
          <th className="text-right p-2">Δ</th>
          <th className="p-2"></th>
        </tr>
      </thead>
      <tbody>
        {assets.map((a) => {
          const prev = prevMap.get(a.name) || 0;
          const delta = (Number(a.value) || 0) - prev;
          return (
            <tr key={a.id} className="border-t border-zinc-800">
              <td className="p-2">{a.name}</td>
              <td className="p-2">{assetTypes[a.type]?.label || a.type}</td>
              <td className="p-2 text-right">{formatCurrency(prev)}</td>
              <td className="p-2 text-right">
                {editingId === a.id ? (
                  <input
                    type="number"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commit(a.id)}
                    onKeyDown={(e) => handleKey(e, a.id)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-right"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => startEdit(a)}
                    className={readOnly ? "" : "cursor-pointer"}
                  >
                    {formatCurrency(a.value)}
                  </span>
                )}
              </td>
              <td className={`p-2 text-right ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                {delta ? formatCurrency(delta) : ""}
              </td>
              <td className="p-2 text-right">
                {!readOnly && (
                  <button
                    onClick={() => remove(a.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
