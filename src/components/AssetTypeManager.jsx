import TextInput from "./TextInput.jsx";

export default function AssetTypeManager({ assetTypes, setAssetTypes, assets }) {
  function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  }
  function updateLabel(key, label) {
    const def = assetTypes[key];
    setAssetTypes({ ...assetTypes, [key]: { ...def, label } });
  }
  function updateFields(key, value) {
    const fields = value
      .split(",")
      .map((s) => slugify(s.trim()))
      .filter(Boolean);
    const def = assetTypes[key];
    setAssetTypes({ ...assetTypes, [key]: { ...def, fields } });
  }
  function addType() {
    const label = window.prompt("New type label", "new type");
    if (!label) return;
    const key = slugify(label);
    if (assetTypes[key]) return alert("Type exists");
    setAssetTypes({ ...assetTypes, [key]: { label, fields: [] } });
  }
  function removeType(key) {
    if (assets && assets.some((a) => a.type === key)) {
      alert("Cannot remove type with existing assets");
      return;
    }
    const { [key]: _discard, ...rest } = assetTypes;
    setAssetTypes(rest);
  }

  return (
    <div className="space-y-4">
      {Object.entries(assetTypes).map(([k, def]) => (
        <div key={k} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-3 space-y-2">
          <div className="flex items-end gap-2">
            <TextInput label="Label" value={def.label} onChange={(v) => updateLabel(k, v)} className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} title="Delete" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">🗑️</button>
            </div>
          </div>
          <TextInput
            label="Fields (comma-separated)"
            value={(def.fields || []).join(", ")}
            onChange={(v) => updateFields(k, v)}
          />
        </div>
      ))}
      <button onClick={addType} title="Add type" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
    </div>
  );
}
