import TextInput from "./TextInput.jsx";

export default function AssetTypeManager({ assetTypes, setAssetTypes, assets }) {
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }
  function updateFieldLabel(typeKey, idx, value) {
    const t = assetTypes[typeKey];
    const fields = t.fields.map((f, i) => (i === idx ? { ...f, label: value } : f));
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }
  function addType() {
    const label = window.prompt("New type", "new_type");
    if (!label) return;
    const key = slugify(label);
    if (assetTypes[key]) return alert("Type exists");
    setAssetTypes({ ...assetTypes, [key]: { fields: [] } });
  }
  function removeType(key) {
    if (assets && assets.some((a) => a.type === key)) {
      alert("Cannot remove type with existing assets");
      return;
    }
    const { [key]: _discard, ...rest } = assetTypes;
    setAssetTypes(rest);
  }
  function addField(typeKey) {
    const label = window.prompt("Field label", "Field");
    if (label) {
      const key = slugify(label);
      const t = assetTypes[typeKey];
      setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields: [...t.fields, { key, label }] } });
    }
  }
  function removeField(typeKey, idx) {
    const t = assetTypes[typeKey];
    const fields = t.fields.filter((_, i) => i !== idx);
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }

  return (
    <div className="space-y-4">
      {Object.entries(assetTypes).map(([k, def]) => (
        <div key={k} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
          <div className="flex items-end gap-2">
            <TextInput label="Type" value={k} onChange={() => {}} disabled className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} title="Delete" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">🗑️</button>
            </div>
          </div>
          {def.fields.map((f, i) => (
            <div key={i} className="flex items-end gap-2">
              <TextInput label="Field key" value={f.key} onChange={() => {}} disabled />
              <TextInput label="Field label" value={f.label} onChange={(v) => updateFieldLabel(k, i, v)} />
              <button onClick={() => removeField(k, i)} title="Remove" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">✖</button>
            </div>
          ))}
          <button onClick={() => addField(k)} title="Add field" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
        </div>
      ))}
      <button onClick={addType} title="Add type" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
    </div>
  );
}
