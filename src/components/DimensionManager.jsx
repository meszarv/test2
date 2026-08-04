import { useEffect, useMemo, useRef, useState } from "react";
import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";
import { SettingsEmptyState, SettingsSectionHeader } from "./SettingsUI.jsx";

export default function DimensionManager({ dimensions, setDimensions, assetTypes, assets, strategy }) {
  const [selectedKey, setSelectedKey] = useState(() => Object.keys(dimensions)[0] || "");
  const [query, setQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const detailRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const hasChangedView = useRef(false);

  useEffect(() => {
    if (!dimensions[selectedKey]) setSelectedKey(Object.keys(dimensions)[0] || "");
  }, [dimensions, selectedKey]);

  useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);

  const filteredDimensions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(dimensions).filter(([key, dimension]) => key === selectedKey || !needle || dimension.name.toLowerCase().includes(needle));
  }, [dimensions, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(dimensions).some((dimension) => dimension.name.toLowerCase().includes(query.trim().toLowerCase()));

  function referenceCount(dimensionKey, valueKey) {
    let count = 0;
    for (const asset of assets || []) {
      if (dimensionKey === "ownership") {
        if (asset.ownership === valueKey) count += 1;
      } else if (Object.prototype.hasOwnProperty.call(asset.dimensions?.[dimensionKey] || {}, valueKey)) count += 1;
    }
    for (const type of Object.values(assetTypes || {})) {
      if (type.dimensionRules?.[dimensionKey]?.value === valueKey) count += 1;
    }
    if (Object.prototype.hasOwnProperty.call(strategy?.dimensionPolicies?.[dimensionKey]?.categories || {}, valueKey)) count += 1;
    return count;
  }

  function renameDimension(key, name) {
    setDimensions({ ...dimensions, [key]: { ...dimensions[key], name } });
  }

  function renameValue(dimensionKey, valueKey, name) {
    const dimension = dimensions[dimensionKey];
    setDimensions({
      ...dimensions,
      [dimensionKey]: { ...dimension, values: { ...dimension.values, [valueKey]: { ...dimension.values[valueKey], name } } },
    });
  }

  function addValue(dimensionKey) {
    const name = window.prompt(`New ${dimensions[dimensionKey].name} value`, "New value");
    if (!name) return;
    const key = mkId();
    setDimensions({
      ...dimensions,
      [dimensionKey]: { ...dimensions[dimensionKey], values: { ...dimensions[dimensionKey].values, [key]: { name } } },
    });
  }

  function removeValue(dimensionKey, valueKey) {
    const references = referenceCount(dimensionKey, valueKey);
    if (references) {
      window.alert(`Cannot remove this value because it has ${references} portfolio reference${references === 1 ? "" : "s"}.`);
      return;
    }
    const values = { ...dimensions[dimensionKey].values };
    delete values[valueKey];
    setDimensions({ ...dimensions, [dimensionKey]: { ...dimensions[dimensionKey], values } });
  }

  const dimension = dimensions[selectedKey];
  const sortedValues = useMemo(() => {
    const entries = Object.entries(dimension?.values || {});
    return entries.sort((left, right) => (sortAsc ? 1 : -1) * left[1].name.localeCompare(right[1].name));
  }, [dimension, sortAsc]);

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title="Dimensions" description="Manage the reusable categories used for concentration analysis and asset-type rules." />
      <div className="grid min-h-[34rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4">
        <div className={`${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`}>
          <div className="border-b border-zinc-800 p-3 space-y-3">
            <h3 className="font-medium">Dimensions</h3>
            <TextInput label="Search dimensions" value={query} onChange={setQuery} />
          </div>
          <div className="max-h-[30rem] overflow-y-auto p-2">
            {filteredDimensions.map(([key, item]) => (
              <button
                type="button"
                key={key}
                onClick={() => { hasChangedView.current = true; setSelectedKey(key); setShowMobileDetail(true); }}
                aria-current={selectedKey === key ? "true" : undefined}
                ref={selectedKey === key ? selectedButtonRef : undefined}
                className={`mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`}
              >
                <span className="block text-sm font-medium">{item.name}</span>
                <span className={`mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`}>{Object.keys(item.values || {}).length} values</span>
              </button>
            ))}
            {!hasQueryMatch && <SettingsEmptyState title="No other matching dimensions" description="The selected dimension remains visible while you search." action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400">Reset search</button>} />}
            {!filteredDimensions.length && <SettingsEmptyState title="No matching dimensions" description="Try a different search term." action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400">Reset search</button>} />}
          </div>
        </div>

        <div ref={detailRef} tabIndex="-1" className={`${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`}>
          {dimension ? (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => { hasChangedView.current = true; setShowMobileDetail(false); }} className="lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm">← Dimensions</button>
                <div>
                  <h3 className="text-lg font-medium">{dimension.name}</h3>
                  <p className="text-xs text-zinc-500">{sortedValues.length} configured value{sortedValues.length === 1 ? "" : "s"}</p>
                </div>
              </div>
              <div className="max-w-md rounded-xl border border-zinc-800 p-4">
                <TextInput label="Dimension name" value={dimension.name} onChange={(name) => renameDimension(selectedKey, name)} />
              </div>

              <div className="rounded-xl border border-zinc-800 overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
                  <div>
                    <h4 className="font-medium">Values</h4>
                    <p className="text-xs text-zinc-500">Values in use are protected from deletion.</p>
                  </div>
                  <button type="button" onClick={() => addValue(selectedKey)} title="Add value" className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500">➕</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[32rem] text-sm">
                    <thead className="text-zinc-400">
                      <tr>
                        <th onClick={() => setSortAsc((value) => !value)} className="cursor-pointer px-4 py-2 text-left">Value {sortAsc ? "▲" : "▼"}</th>
                        <th className="px-4 py-2 text-left">References</th>
                        <th className="w-16 px-4 py-2 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedValues.map(([valueKey, value]) => {
                        const references = referenceCount(selectedKey, valueKey);
                        return (
                          <tr key={valueKey} className="border-t border-zinc-800">
                            <td className="px-4 py-2"><TextInput label="Value" value={value.name} onChange={(name) => renameValue(selectedKey, valueKey, name)} /></td>
                            <td className="px-4 py-2 text-zinc-400">{references ? `${references} portfolio reference${references === 1 ? "" : "s"}` : "Not used"}</td>
                            <td className="px-4 py-2 text-right">
                              <button
                                type="button"
                                title={references ? `Cannot delete: ${references} references` : "Delete"}
                                disabled={!!references}
                                onClick={() => removeValue(selectedKey, valueKey)}
                                className="h-9 w-9 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-40"
                              >🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!sortedValues.length && <SettingsEmptyState title="No values" description="Add the first value for this dimension." />}
                </div>
              </div>
            </div>
          ) : <SettingsEmptyState title="No dimensions" description="No configurable concentration dimensions are available." />}
        </div>
      </div>
    </div>
  );
}
