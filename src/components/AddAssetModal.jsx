import React, { useEffect, useState } from "react";
import TextInput from "./TextInput.jsx";

export default function AddAssetModal({ open, onClose, assetTypes, onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(Object.keys(assetTypes)[0] || "");
  useEffect(() => {
    setType(Object.keys(assetTypes)[0] || "");
  }, [assetTypes]);
  const [value, setValue] = useState("");
  const [fields, setFields] = useState({});

  useEffect(() => {
    const def = assetTypes[type] || { fields: [] };
    const init = {};
    for (const k of def.fields || []) init[k] = "";
    setFields(init);
  }, [type, assetTypes]);

  function submit(e) {
    if (e) e.preventDefault();
    onAdd({ name, type, value: Number(value || 0), ...fields });
    setName("");
    setType(Object.keys(assetTypes)[0] || "");
    setValue("");
    setFields({});
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
        <h2 className="text-lg font-medium">Add asset</h2>
        <TextInput autoFocus label="Name" value={name} onChange={setName} />
        <label className="block text-sm">
          <span className="text-zinc-400">Class</span>
          <select
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {Object.keys(assetTypes).map((k) => (
              <option key={k} value={k}>{assetTypes[k]?.label || k}</option>
            ))}
          </select>
        </label>
        {(assetTypes[type]?.fields || []).map((k) => (
          <TextInput
            key={k}
            label={k}
            value={fields[k] || ""}
            onChange={(v) => setFields({ ...fields, [k]: v })}
          />
        ))}
        <TextInput label="Value" type="number" value={value} onChange={setValue} />
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} title="Close" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">✖</button>
          <button type="submit" title="Add" className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">➕</button>
        </div>
      </form>
    </div>
  );
}
