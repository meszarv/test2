import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";

export default function AssetTypeManager({ assetTypes, setAssetTypes, assets, dimensions }) {
  function updateName(key, name) {
    setAssetTypes({ ...assetTypes, [key]: { ...assetTypes[key], name } });
  }

  function updateRule(typeKey, dimensionKey, patch) {
    const definition = assetTypes[typeKey];
    const current = definition.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
    let next = { ...current, ...patch };
    if ((next.mode === "locked" || next.mode === "default") && !next.value) {
      next.value = Object.keys(dimensions[dimensionKey]?.values || {})[0] || "";
    }
    setAssetTypes({
      ...assetTypes,
      [typeKey]: {
        ...definition,
        dimensionRules: { ...definition.dimensionRules, [dimensionKey]: next },
      },
    });
  }

  function addType() {
    const name = window.prompt("New asset type", "New type");
    if (!name) return;
    setAssetTypes({ ...assetTypes, [mkId()]: { name, dimensionRules: {} } });
  }

  function removeType(key) {
    if ((assets || []).some((asset) => asset.type === key)) {
      window.alert("Cannot remove a type used by an asset.");
      return;
    }
    const copy = { ...assetTypes };
    delete copy[key];
    setAssetTypes(copy);
  }

  return (
    <div className="space-y-4">
      {Object.entries(assetTypes).map(([typeKey, definition]) => (
        <div key={typeKey} className="border border-zinc-800 bg-zinc-900/60 rounded-xl p-4 space-y-3">
          <div className="flex items-end gap-2">
            <TextInput label="Name" value={definition.name} onChange={(name) => updateName(typeKey, name)} className="flex-1" />
            <button onClick={() => removeType(typeKey)} title="Delete" className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">🗑️</button>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Dimension rules</div>
            {Object.entries(dimensions).filter(([key]) => key !== "ownership").map(([dimensionKey, dimension]) => {
              const rule = definition.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
              return (
                <div key={dimensionKey} className="grid grid-cols-[1fr_10rem_1fr] gap-2 items-center">
                  <span className="text-sm text-zinc-300">{dimension.name}</span>
                  <select
                    value={rule.mode || "user"}
                    onChange={(event) => updateRule(typeKey, dimensionKey, { mode: event.target.value })}
                    className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 text-sm"
                  >
                    <option value="user">User selects</option>
                    <option value="default">Default</option>
                    <option value="locked">Locked</option>
                    <option value="na">Not applicable</option>
                  </select>
                  <select
                    value={rule.value || ""}
                    onChange={(event) => updateRule(typeKey, dimensionKey, { value: event.target.value })}
                    disabled={rule.mode === "user" || rule.mode === "na"}
                    className="rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 text-sm disabled:opacity-40"
                  >
                    <option value="">Select value</option>
                    {Object.entries(dimension.values || {}).map(([valueKey, value]) => (
                      <option key={valueKey} value={valueKey}>{value.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <button onClick={addType} title="Add type" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">➕</button>
    </div>
  );
}
