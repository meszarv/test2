import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";

export default function DimensionManager({ dimensions, setDimensions, assetTypes, assets, strategy }) {
  function renameDimension(key, name) {
    setDimensions({ ...dimensions, [key]: { ...dimensions[key], name } });
  }

  function renameValue(dimensionKey, valueKey, name) {
    const dimension = dimensions[dimensionKey];
    setDimensions({
      ...dimensions,
      [dimensionKey]: {
        ...dimension,
        values: { ...dimension.values, [valueKey]: { ...dimension.values[valueKey], name } },
      },
    });
  }

  function addValue(dimensionKey) {
    const name = window.prompt(`New ${dimensions[dimensionKey].name} value`, "New value");
    if (!name) return;
    const key = mkId();
    setDimensions({
      ...dimensions,
      [dimensionKey]: {
        ...dimensions[dimensionKey],
        values: { ...dimensions[dimensionKey].values, [key]: { name } },
      },
    });
  }

  function removeValue(dimensionKey, valueKey) {
    const usedByAsset = (assets || []).some((asset) => dimensionKey === "ownership"
      ? asset.ownership === valueKey
      : Object.prototype.hasOwnProperty.call(asset.dimensions?.[dimensionKey] || {}, valueKey));
    const usedByRule = Object.values(assetTypes || {}).some((type) => type.dimensionRules?.[dimensionKey]?.value === valueKey);
    const usedByStrategy = Object.prototype.hasOwnProperty.call(strategy?.dimensionPolicies?.[dimensionKey]?.categories || {}, valueKey);
    if (usedByAsset || usedByRule || usedByStrategy) {
      window.alert("Cannot remove a value used by an asset, asset-type rule, or strategy.");
      return;
    }
    const values = { ...dimensions[dimensionKey].values };
    delete values[valueKey];
    setDimensions({ ...dimensions, [dimensionKey]: { ...dimensions[dimensionKey], values } });
  }

  return (
    <div className="space-y-4">
      {Object.entries(dimensions).map(([dimensionKey, dimension]) => (
        <div key={dimensionKey} className="border border-zinc-800 rounded-xl p-3 space-y-3">
          <TextInput label="Dimension name" value={dimension.name} onChange={(name) => renameDimension(dimensionKey, name)} />
          <div className="space-y-2">
            {Object.entries(dimension.values || {}).map(([valueKey, value]) => (
              <div key={valueKey} className="flex items-end gap-2">
                <TextInput className="flex-1" label="Value" value={value.name} onChange={(name) => renameValue(dimensionKey, valueKey, name)} />
                <button
                  type="button"
                  title="Delete"
                  onClick={() => removeValue(dimensionKey, valueKey)}
                  className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addValue(dimensionKey)} title="Add value" className="h-9 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-sm">
            ➕
          </button>
        </div>
      ))}
    </div>
  );
}
