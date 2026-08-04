import { useEffect, useMemo, useRef, useState } from "react";
import TextInput from "./TextInput.jsx";
import { mkId } from "../utils.js";
import { SettingsEmptyState, SettingsSectionHeader } from "./SettingsUI.jsx";

export default function LiabilityTypeManager({ liabilityTypes, setLiabilityTypes, liabilities }) {
  const [selectedKey, setSelectedKey] = useState(() => Object.keys(liabilityTypes)[0] || "");
  const [query, setQuery] = useState("");
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const detailRef = useRef(null);
  const selectedButtonRef = useRef(null);
  const hasChangedView = useRef(false);

  useEffect(() => {
    if (!liabilityTypes[selectedKey]) setSelectedKey(Object.keys(liabilityTypes)[0] || "");
  }, [liabilityTypes, selectedKey]);

  useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);

  const usageCounts = useMemo(() => {
    const counts = {};
    for (const liability of liabilities || []) counts[liability.type] = (counts[liability.type] || 0) + 1;
    return counts;
  }, [liabilities]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(liabilityTypes).filter(([key, definition]) => key === selectedKey || !needle || definition.name.toLowerCase().includes(needle));
  }, [liabilityTypes, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(liabilityTypes).some((definition) => definition.name.toLowerCase().includes(query.trim().toLowerCase()));

  function updateName(key, name) {
    setLiabilityTypes({ ...liabilityTypes, [key]: { ...liabilityTypes[key], name } });
  }

  function addType() {
    const name = window.prompt("New liability type", "New type");
    if (!name) return;
    const key = mkId();
    hasChangedView.current = true;
    setLiabilityTypes({ ...liabilityTypes, [key]: { name } });
    setSelectedKey(key);
    setShowMobileDetail(true);
  }

  function removeType(key) {
    if (usageCounts[key]) {
      window.alert(`Cannot remove this type because ${usageCounts[key]} liabilit${usageCounts[key] === 1 ? "y uses" : "ies use"} it.`);
      return;
    }
    const { [key]: _discard, ...rest } = liabilityTypes;
    hasChangedView.current = true;
    setLiabilityTypes(rest);
    setSelectedKey(Object.keys(rest)[0] || "");
    setShowMobileDetail(false);
  }

  const definition = liabilityTypes[selectedKey];

  return (
    <div className="space-y-6">
      <SettingsSectionHeader title="Liability Types" description="Manage the simple categories used by liabilities in Total Net Worth." />
      <div className="grid min-h-[28rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4">
        <div className={`${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`}>
          <div className="border-b border-zinc-800 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">Types</h3>
              <button type="button" onClick={addType} title="Add type" className="h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500">➕</button>
            </div>
            <TextInput label="Search liability types" value={query} onChange={setQuery} />
          </div>
          <div className="max-h-[24rem] overflow-y-auto p-2">
            {filtered.map(([key, type]) => (
              <button
                type="button"
                key={key}
                onClick={() => { hasChangedView.current = true; setSelectedKey(key); setShowMobileDetail(true); }}
                aria-current={selectedKey === key ? "true" : undefined}
                ref={selectedKey === key ? selectedButtonRef : undefined}
                className={`mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`}
              >
                <span className="block text-sm font-medium">{type.name}</span>
                <span className={`mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`}>{usageCounts[key] || 0} liabilities</span>
              </button>
            ))}
            {!hasQueryMatch && <SettingsEmptyState title="No other matching liability types" description="The selected type remains visible while you search." action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400">Reset search</button>} />}
            {!filtered.length && <SettingsEmptyState title="No matching liability types" description="Try a different search term." action={<button type="button" onClick={() => setQuery("")} className="text-sm text-blue-400">Reset search</button>} />}
          </div>
        </div>

        <div ref={detailRef} tabIndex="-1" className={`${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`}>
          {definition ? (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { hasChangedView.current = true; setShowMobileDetail(false); }} className="lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm">← Types</button>
                  <div>
                    <h3 className="text-lg font-medium">{definition.name}</h3>
                    <p className="text-xs text-zinc-500">{usageCounts[selectedKey] || 0} current liabilit{usageCounts[selectedKey] === 1 ? "y" : "ies"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeType(selectedKey)}
                  title="Delete"
                  aria-disabled={!!usageCounts[selectedKey]}
                  className={`h-10 w-10 rounded-lg border border-red-900 bg-red-950/50 text-red-300 ${usageCounts[selectedKey] ? "opacity-50" : "hover:bg-red-900/60"}`}
                >🗑️</button>
              </div>
              <div className="max-w-md rounded-xl border border-zinc-800 p-4">
                <TextInput label="Liability type name" value={definition.name} onChange={(value) => updateName(selectedKey, value)} />
                {usageCounts[selectedKey] > 0 && <p className="mt-2 text-xs text-zinc-500">This type cannot be deleted while it is referenced by existing liabilities.</p>}
              </div>
            </div>
          ) : <SettingsEmptyState title="No liability types" description="Add a type before recording a liability." action={<button type="button" onClick={addType} className="rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500">➕ Add type</button>} />}
        </div>
      </div>
    </div>
  );
}
