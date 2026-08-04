import TextInput from "./TextInput.jsx";

export default function DimensionExposureEditor({ definition, value = {}, rule, onChange }) {
  if (rule?.mode === "na") {
    return <div className="text-xs text-zinc-500">Not applicable for this asset type</div>;
  }

  const locked = rule?.mode === "locked";
  const entries = Object.entries(value || {});
  const options = Object.entries(definition?.values || {});
  const total = entries.reduce((sum, [, percentage]) => sum + (Number(percentage) || 0), 0);

  function updateCategory(previous, next) {
    if (!next || previous === next) return;
    const copy = { ...value };
    const percentage = copy[previous] ?? 100;
    delete copy[previous];
    copy[next] = percentage;
    onChange(copy);
  }

  function updatePercentage(category, percentage) {
    onChange({ ...value, [category]: Number(percentage) || 0 });
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

  return (
    <div className="space-y-2">
      {entries.map(([category, percentage]) => (
        <div key={category} className="grid grid-cols-[1fr_7rem_2.5rem] items-end gap-2">
          <label className="block text-sm">
            <span className="text-zinc-400">Category</span>
            <select
              value={category}
              disabled={locked}
              onChange={(event) => updateCategory(category, event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 disabled:opacity-60"
            >
              {options.map(([key, option]) => (
                <option key={key} value={key}>{option.name}</option>
              ))}
            </select>
          </label>
          <TextInput
            label="Exposure %"
            type="number"
            value={String(percentage)}
            onChange={(next) => updatePercentage(category, next)}
            disabled={locked}
          />
          <button
            type="button"
            title="Delete exposure"
            disabled={locked}
            onClick={() => removeExposure(category)}
            className="h-10 w-10 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30"
          >
            🗑️
          </button>
        </div>
      ))}
      {!locked && (
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            title="Add exposure"
            onClick={addExposure}
            disabled={entries.length >= options.length}
            className="h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 text-sm"
          >
            ➕
          </button>
          <span className={`text-xs ${entries.length && Math.abs(total - 100) < 0.01 ? "text-emerald-400" : "text-amber-400"}`}>
            {entries.length ? `Total ${total}%` : "Unclassified"}
          </span>
        </div>
      )}
    </div>
  );
}
