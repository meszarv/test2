import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";

export default function AssetTypeManager({ assetTypes, setAssetTypes, assets }) {
  function updateName(key, name) {
    const def = assetTypes[key];
    setAssetTypes({ ...assetTypes, [key]: { ...def, name } });
  }
  function addType() {
    const name = window.prompt("New asset type", "New type");
    if (!name) return;
    const key = mkId();
    setAssetTypes({ ...assetTypes, [key]: { name } });
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
            <TextInput label="Name" value={def.name} onChange={(v) => updateName(k, v)} className="md:col-span-3" />
            <div className="flex-1 text-right">
              <button onClick={() => removeType(k)} title="Delete" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">🗑️</button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addType} title="Add type" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
    </div>
  );
}
