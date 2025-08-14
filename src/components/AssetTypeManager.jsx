import TextInput from "./TextInput.jsx";
import AddBtn from "./AddBtn.jsx";

export default function AssetTypeManager({ assetTypes, setAssetTypes }) {
  function updateLabel(k, label) {
    setAssetTypes({ ...assetTypes, [k]: { ...assetTypes[k], label } });
  }
  function updateFieldKey(typeKey, idx, value) {
    const t = assetTypes[typeKey];
    const fields = t.fields.map((f, i) => (i === idx ? { ...f, key: value } : f));
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }
  function updateFieldLabel(typeKey, idx, value) {
    const t = assetTypes[typeKey];
    const fields = t.fields.map((f, i) => (i === idx ? { ...f, label: value } : f));
    setAssetTypes({ ...assetTypes, [typeKey]: { ...t, fields } });
  }
  function addType() {
    const key = window.prompt("New type key", "new_type");
    if (key && !assetTypes[key]) setAssetTypes({ ...assetTypes, [key]: { label: key, fields: [] } });
  }
  function removeType(key) {
    const { [key]: _discard, ...rest } = assetTypes;
    setAssetTypes(rest);
  }
  function addField(typeKey) {
    const key = window.prompt("Field key", "field");
    const label = window.prompt("Field label", "Field");
    if (key && label) {
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
            <TextInput label="Label" value={def.label} onChange={(v) => updateLabel(k, v)} className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Delete</button>
            </div>
          </div>
          {def.fields.map((f, i) => (
            <div key={i} className="flex items-end gap-2">
              <TextInput label="Field key" value={f.key} onChange={(v) => updateFieldKey(k, i, v)} />
              <TextInput label="Field label" value={f.label} onChange={(v) => updateFieldLabel(k, i, v)} />
              <button onClick={() => removeField(k, i)} className="h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">Remove</button>
            </div>
          ))}
          <button onClick={() => addField(k)} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">Add field</button>
        </div>
      ))}
      <AddBtn onClick={addType}>Add type</AddBtn>
    </div>
  );
}
