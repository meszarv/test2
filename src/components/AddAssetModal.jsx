import React, { useState } from "react";
import TextInput from "./TextInput.jsx";

export default function AddAssetModal({ open, onClose, assetTypes, onAdd }) {
  const [name, setName] = useState("");
  const [type, setType] = useState(Object.keys(assetTypes)[0] || "");
  const [value, setValue] = useState("");

  function submit() {
    onAdd({ name, type, value: Number(value || 0) });
    setName("");
    setType(Object.keys(assetTypes)[0] || "");
    setValue("");
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
        <h2 className="text-lg font-medium">Add asset</h2>
        <TextInput label="Name" value={name} onChange={setName} />
        <label className="block text-sm">
          <span className="text-zinc-400">Class</span>
          <select
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {Object.entries(assetTypes).map(([k, d]) => (
              <option key={k} value={k}>{d.label}</option>
            ))}
          </select>
        </label>
        <TextInput label="Value" type="number" value={value} onChange={setValue} />
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Cancel</button>
          <button onClick={submit} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Add</button>
        </div>
      </div>
    </div>
  );
}
