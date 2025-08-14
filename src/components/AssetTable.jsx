import React, { useState } from "react";
import { formatCurrency } from "../utils.js";
import TextInput from "./TextInput.jsx";

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, readOnly = false }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState("");
  const [fieldEdit, setFieldEdit] = useState(null);
  const [fieldDraft, setFieldDraft] = useState({});

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

    function openFields(a) {
      if (readOnly) return;
      const def = assetTypes[a.type] || { fields: [] };
      const draft = {};
      for (const f of def.fields) draft[f.key] = a[f.key] || "";
      setFieldDraft(draft);
      setFieldEdit(a);
    }

    function saveFields() {
      const updated = assets.map((a) => (a.id === fieldEdit.id ? { ...a, ...fieldDraft } : a));
      setAssets(updated);
      setFieldEdit(null);
    }

    return (
      <>
      <table className="w-full text-sm">
        <thead className="text-zinc-400">
          <tr>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Class</th>
            <th className="text-left p-2">Description</th>
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
            const def = assetTypes[a.type] || { fields: [] };
            const desc = def.fields.map((f) => `${f.label}: ${a[f.key] || ""}`).join(", ");
            return (
              <tr key={a.id} className="border-t border-zinc-800" onDoubleClick={() => openFields(a)}>
                <td className="p-2">{a.name}</td>
                <td className="p-2">{assetTypes[a.type]?.label || a.type}</td>
                <td className="p-2">{desc}</td>
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
      {fieldEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
            <h2 className="text-lg font-medium">Edit {fieldEdit.name}</h2>
            {(assetTypes[fieldEdit.type]?.fields || []).map((f) => (
              <TextInput
                key={f.key}
                label={f.label}
                value={fieldDraft[f.key] || ""}
                onChange={(v) => setFieldDraft({ ...fieldDraft, [f.key]: v })}
              />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setFieldEdit(null)} title="Close" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">✖</button>
              <button onClick={saveFields} title="Save" className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">✔</button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }
