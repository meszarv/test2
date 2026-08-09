import { useState } from "react";
import { PercentageInput } from "./NumberInput.jsx";

export default function DimensionExposureEditor({ definition, value = {}, rule, onChange }) {
  const locked = rule?.mode === "locked";
  const entries = Object.entries(value || {});
  const options = Object.entries(definition?.values || {});
  const total = entries.reduce((sum, [, percentage]) => sum + (Number(percentage) || 0), 0);
  const [editingSplit, setEditingSplit] = useState(false);

  if (rule?.mode === "na") return null;

  const categoryName = (category) => definition?.values?.[category]?.name || category;
  const positiveEntries = entries.filter(([, percentage]) => Number(percentage) > 0);
  const singleCategory = entries.length === 1 ? entries[0][0] : "";

  function chooseSingleCategory(category) {
    onChange(category ? { [category]: 100 } : {});
  }

  function updateCategory(previous, next) {
    if (!next || previous === next) return;
    const copy = { ...value };
    const percentage = copy[previous] ?? 100;
    delete copy[previous];
    copy[next] = percentage;
    onChange(copy);
  }

  function updatePercentage(category, percentage) {
    onChange({ ...value, [category]: percentage });
  }

  function addExposure() {
    const available = options.find(([key]) => !Object.prototype.hasOwnProperty.call(value, key));
    if (!available) return;
    onChange({ ...value, [available[0]]: entries.length ? 0 : 100 });
  }

  function removeExposure(category) {
    const copy = { ...value };
    delete copy[category];
    onChange(copy);
  }

  function finishSplit() {
    const positive = Object.fromEntries(positiveEntries);
    if (positiveEntries.length === 1) {
      onChange({ [positiveEntries[0][0]]: 100 });
    } else if (positiveEntries.length !== entries.length) {
      onChange(positive);
    }
    setEditingSplit(false);
  }

  if (locked) {
    return (
      <div className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-sm">
        <span>{positiveEntries.length ? positiveEntries.map(([category]) => categoryName(category)).join(" · ") : "Unclassified"}</span>
        <span className="shrink-0 text-xs text-zinc-500">Fixed by asset type</span>
      </div>
    );
  }

  if (!editingSplit && entries.length <= 1) {
    return (
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1 text-sm">
          <span className="sr-only">{definition.name} category</span>
          <select
            value={singleCategory}
            aria-label={`${definition.name} category`}
            onChange={(event) => chooseSingleCategory(event.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-100"
          >
            <option value="">Choose category…</option>
            {options.map(([key, option]) => <option key={key} value={key}>{option.name}</option>)}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setEditingSplit(true)}
          aria-label={`Split ${definition.name} allocation`}
          disabled={!options.length}
          className="h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs hover:bg-zinc-700 disabled:opacity-30"
        >
          Split allocation
        </button>
      </div>
    );
  }

  if (!editingSplit) {
    return (
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-sm">
        <span>{positiveEntries.map(([category, percentage]) => `${categoryName(category)} ${percentage}%`).join(" · ") || "Unclassified"}</span>
        <button type="button" onClick={() => setEditingSplit(true)} aria-label={`Edit ${definition.name} split`} className="shrink-0 text-sm text-blue-400 hover:text-blue-300">Edit split</button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-950/40 p-3">
      {entries.map(([category, percentage]) => (
        <div key={category} className="grid grid-cols-[1fr_7rem_2.5rem] items-end gap-2">
          <label className="block text-sm">
            <span className="text-zinc-400">Category</span>
            <select
              value={category}
              aria-label={`${definition.name} category`}
              disabled={locked}
              onChange={(event) => updateCategory(category, event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 disabled:opacity-60"
            >
              {options.map(([key, option]) => (
                <option key={key} value={key}>{option.name}</option>
              ))}
            </select>
          </label>
          <PercentageInput
            label="Exposure %"
            value={String(percentage)}
            onChange={(next) => updatePercentage(category, next)}
            disabled={locked}
          />
          <button
            type="button"
            title="Delete exposure"
            aria-label={`Delete ${definition.name} exposure`}
            disabled={locked}
            onClick={() => removeExposure(category)}
            className="h-10 w-10 rounded-lg border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-950/60 disabled:opacity-30"
          >
            🗑️
          </button>
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Add exposure"
            aria-label={`Add ${definition.name} exposure`}
            onClick={addExposure}
            disabled={entries.length >= options.length}
            className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 text-sm"
          >
            ➕
          </button>
          <button type="button" onClick={finishSplit} className="h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm hover:bg-zinc-700">
            {positiveEntries.length <= 1 ? "Use single category" : "Done"}
          </button>
        </div>
        <span className={`text-xs ${entries.length && Math.abs(total - 100) < 0.01 ? "text-emerald-400" : "text-amber-400"}`}>
          {entries.length ? `Total ${total}%` : "Unclassified"}
        </span>
      </div>
    </div>
  );
}
