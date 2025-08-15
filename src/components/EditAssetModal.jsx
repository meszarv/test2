import React, { useEffect, useState } from "react";
import TextInput from "./TextInput.jsx";

export default function EditAssetModal({ open, asset, onClose, assetTypes, onSave, onDelete }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (asset) {
      setName(asset.name || "");
      setType(asset.type || Object.keys(assetTypes)[0] || "");
      setDescription(asset.description || "");
      setValue(asset.value);
    }
  }, [asset, assetTypes]);

  function submit(e) {
    if (e) e.preventDefault();
    if (!asset) return;
    onSave({ ...asset, name, type, description, value: Number(value || 0) });
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
        <h2 className="text-lg font-medium">Edit asset</h2>
        <TextInput autoFocus label="Name" value={name} onChange={setName} />
        <label className="block text-sm">
          <span className="text-zinc-400">Type</span>
          <select
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {Object.keys(assetTypes).map((k) => (
              <option key={k} value={k}>
                {assetTypes[k]?.name || k}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-zinc-400">Description</span>
          <textarea
            className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <TextInput label="Value" type="number" value={value} onChange={setValue} inputClassName="w-32" />
        <div className="flex justify-between gap-2 pt-2">
          <button
            type="button"
            onClick={() => onDelete && onDelete(asset)}
            title="Delete"
            className="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600"
          >
            🗑️
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
            >
              ✖
            </button>
            <button
              type="submit"
              title="Save"
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            >
              💾
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
