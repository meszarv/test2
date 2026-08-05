import { useEffect, useMemo, useRef, useState } from "react";
import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";
import { portfolioScopeOptions } from "../data.js";
import { CollapsiblePanel, SettingsEmptyState, SettingsSectionHeader, SettingsSummaryCard } from "./SettingsUI.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import NameDialog from "./NameDialog.jsx";
import UndoToast from "./UndoToast.jsx";

const ruleModeLabels = { user: "User selects", default: "Default", locked: "Locked", na: "Not applicable" };

export default function AssetTypeManager({ assetTypes, setAssetTypes, assets, dimensions, initialSearch = "", initialNewName = "" }) {
  const [selectedKey, setSelectedKey] = useState(() => Object.keys(assetTypes)[0] || "");
  const [query, setQuery] = useState(initialSearch);
  const [openDimension, setOpenDimension] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState("");
  const [undo, setUndo] = useState(null);
  const detailRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const hasChangedView = useRef(false);

  useEffect(() => {
    if (!assetTypes[selectedKey]) setSelectedKey(Object.keys(assetTypes)[0] || "");
  }, [assetTypes, selectedKey]);

  useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);

  const usageCounts = useMemo(() => {
    const counts = {};
    for (const asset of assets || []) counts[asset.type] = (counts[asset.type] || 0) + 1;
    return counts;
  }, [assets]);

  const filteredTypes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(assetTypes).filter(([key, definition]) =>
      key === selectedKey || !needle || definition.name.toLowerCase().includes(needle)
    );
  }, [assetTypes, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(assetTypes).some((definition) => definition.name.toLowerCase().includes(query.trim().toLowerCase()));

  function selectType(key) {
    hasChangedView.current = true;
    setSelectedKey(key);
    setOpenDimension("");
    setShowMobileDetail(true);
  }

  function updateName(key, name) {
    setAssetTypes({ ...assetTypes, [key]: { ...assetTypes[key], name } });
  }

  function updateRule(typeKey, dimensionKey, patch) {
    const definition = assetTypes[typeKey];
    const current = definition.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
    let next = { ...current, ...patch };
    if ((next.mode === "locked" || next.mode === "default") && !next.value) next.value = Object.keys(dimensions[dimensionKey]?.values || {})[0] || "";
    setAssetTypes({
      ...assetTypes,
      [typeKey]: { ...definition, dimensionRules: { ...definition.dimensionRules, [dimensionKey]: next } },
    });
  }

  function updateScopeRule(typeKey, patch) {
    const definition = assetTypes[typeKey];
    const current = definition.scopeRule || { mode: "user", value: "" };
    let next = { ...current, ...patch };
    if ((next.mode === "locked" || next.mode === "default") && !next.value) next.value = "total";
    setAssetTypes({ ...assetTypes, [typeKey]: { ...definition, scopeRule: next } });
  }

  function addType(name) {
    const key = mkId();
    hasChangedView.current = true;
    setAssetTypes({ ...assetTypes, [key]: { name, scopeRule: { mode: "user", value: "" }, dimensionRules: {} } });
    setSelectedKey(key);
    setShowMobileDetail(true);
    setAddOpen(false);
  }

  function removeType(key) {
    if (usageCounts[key]) return;
    const copy = { ...assetTypes };
    const removed = copy[key];
    delete copy[key];
    const nextKey = Object.keys(copy)[0] || "";
    hasChangedView.current = true;
    setAssetTypes(copy);
    setSelectedKey(nextKey);
    setShowMobileDetail(false);
    setDeleteKey("");
    setUndo({ key, definition: removed });
  }

  const definition = assetTypes[selectedKey];
  const ruleCounts = { locked: 0, default: 0, user: 0, na: 0 };
  for (const [key] of Object.entries(dimensions).filter(([key]) => key !== "ownership")) {
    const mode = definition?.dimensionRules?.[key]?.mode || "user";
    ruleCounts[mode] = (ruleCounts[mode] || 0) + 1;
  }
  const scopeRule = definition?.scopeRule || { mode: "user", value: "" };

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title="Asset Types" description="Configure reusable scope defaults and classification rules without editing every asset individually." />
      <div className="grid min-h-[34rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4">
        <div className={`${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`}>
          <div className="border-b border-zinc-800 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">Types</h3>
              <button type="button" onClick={() => setAddOpen(true)} title="Add type" className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500">➕</button>
            </div>
            <TextInput label="Search asset types" value={query} onChange={setQuery} />
          </div>
          <div className="max-h-[30rem] overflow-y-auto p-2">
            {filteredTypes.map(([key, type]) => {
              const rule = type.scopeRule || { mode: "user", value: "" };
              const scope = rule.value ? portfolioScopeOptions[rule.value]?.name : "User selects";
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => selectType(key)}
                  aria-current={selectedKey === key ? "true" : undefined}
                  ref={selectedKey === key ? selectedButtonRef : undefined}
                  className={`mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`}
                >
                  <span className="block text-sm font-medium">{type.name}</span>
                  <span className={`mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`}>{ruleModeLabels[rule.mode] || "User selects"}: {scope} · {usageCounts[key] || 0} assets</span>
                </button>
              );
            })}
            {!hasQueryMatch && <SettingsEmptyState title="No other matching asset types" description="The selected type remains visible while you search." action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400 hover:text-blue-300">Reset search</button>} />}
            {!filteredTypes.length && (
              <SettingsEmptyState
                title="No matching asset types"
                description="Try a different search term."
                action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400 hover:text-blue-300">Reset search</button>}
              />
            )}
          </div>
        </div>

        <div ref={detailRef} tabIndex="-1" className={`${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`}>
          {definition ? (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { hasChangedView.current = true; setShowMobileDetail(false); }} className="lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm">← Types</button>
                  <div>
                    <h3 className="text-lg font-medium">{definition.name}</h3>
                    <p className="text-xs text-zinc-500">{usageCounts[selectedKey] || 0} current asset{usageCounts[selectedKey] === 1 ? "" : "s"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteKey(selectedKey)}
                  title={usageCounts[selectedKey] ? "Cannot delete a type used by assets" : "Delete"}
                  disabled={!!usageCounts[selectedKey]}
                  className="h-10 w-10 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-40"
                >🗑️</button>
              </div>
              {!!usageCounts[selectedKey] && <p className="text-xs text-zinc-500">This type cannot be deleted because {usageCounts[selectedKey]} asset{usageCounts[selectedKey] === 1 ? " uses" : "s use"} it.</p>}

              <div className="grid md:grid-cols-2 gap-4 rounded-xl border border-zinc-800 p-4">
                <TextInput label="Asset type name" value={definition.name} onChange={(name) => updateName(selectedKey, name)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="text-zinc-400">Scope behavior</span>
                    <select value={scopeRule.mode || "user"} onChange={(event) => updateScopeRule(selectedKey, { mode: event.target.value })} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="user">User selects</option>
                      <option value="default">Default</option>
                      <option value="locked">Locked</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-zinc-400">Portfolio scope</span>
                    <select value={scopeRule.value || ""} onChange={(event) => updateScopeRule(selectedKey, { value: event.target.value })} disabled={scopeRule.mode === "user"} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select scope</option>
                      {Object.entries(portfolioScopeOptions).map(([key, option]) => <option key={key} value={key}>{option.name}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <SettingsSummaryCard label="Locked" value={ruleCounts.locked} />
                <SettingsSummaryCard label="Defaults" value={ruleCounts.default} />
                <SettingsSummaryCard label="User selects" value={ruleCounts.user} />
                <SettingsSummaryCard label="Not applicable" value={ruleCounts.na} />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Dimension rules</h4>
                {Object.entries(dimensions).filter(([key]) => key !== "ownership").map(([dimensionKey, dimension]) => {
                  const rule = definition.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
                  const valueName = dimension.values?.[rule.value]?.name;
                  return (
                    <CollapsiblePanel
                      key={dimensionKey}
                      title={dimension.name}
                      summary={`${ruleModeLabels[rule.mode] || "User selects"}${valueName ? ` · ${valueName}` : ""}`}
                      open={openDimension === dimensionKey}
                      onToggle={() => setOpenDimension((current) => current === dimensionKey ? "" : dimensionKey)}
                    >
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="block text-sm">
                          <span className="text-zinc-400">Rule</span>
                          <select value={rule.mode || "user"} onChange={(event) => updateRule(selectedKey, dimensionKey, { mode: event.target.value })} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="user">User selects</option>
                            <option value="default">Default</option>
                            <option value="locked">Locked</option>
                            <option value="na">Not applicable</option>
                          </select>
                        </label>
                        <label className="block text-sm">
                          <span className="text-zinc-400">Value</span>
                          <select value={rule.value || ""} onChange={(event) => updateRule(selectedKey, dimensionKey, { value: event.target.value })} disabled={rule.mode === "user" || rule.mode === "na"} className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select value</option>
                            {Object.entries(dimension.values || {}).map(([valueKey, value]) => <option key={valueKey} value={valueKey}>{value.name}</option>)}
                          </select>
                        </label>
                      </div>
                    </CollapsiblePanel>
                  );
                })}
              </div>
            </div>
          ) : (
            <SettingsEmptyState title="No asset types" description="Add an asset type to configure its portfolio scope and dimension rules." action={<button type="button" onClick={() => setAddOpen(true)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500">➕ Add type</button>} />
          )}
        </div>
      </div>
      <NameDialog open={addOpen} title="Add asset type" label="Asset type name" initialValue={initialNewName} existingNames={Object.values(assetTypes).map((type) => type.name)} onClose={() => setAddOpen(false)} onSave={addType} />
      <ConfirmModal open={!!deleteKey} title="Delete asset type?" message={deleteKey ? `Delete “${assetTypes[deleteKey]?.name}” from the available asset types?` : ""} onCancel={() => setDeleteKey("")} onConfirm={() => removeType(deleteKey)} />
      <UndoToast message={undo ? "Asset type deleted." : ""} onUndo={() => { if (!undo) return; setAssetTypes({ ...assetTypes, [undo.key]: undo.definition }); setSelectedKey(undo.key); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </div>
  );
}
