export function SettingsSectionHeader({ title, description, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm text-zinc-400">{description}</p>}
      </div>
      {right}
    </div>
  );
}

export function SettingsSummaryCard({ label, value, description, tone = "default" }) {
  const tones = {
    default: "border-zinc-800 bg-zinc-900/70",
    info: "border-blue-900/70 bg-blue-950/20",
    warning: "border-amber-800/70 bg-amber-950/20",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.default}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-medium text-zinc-100">{value}</div>
      {description && <p className="mt-1 text-xs text-zinc-400">{description}</p>}
    </div>
  );
}

export function SettingsValidation({ children, valid = false }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${valid ? "border-emerald-900/70 bg-emerald-950/20 text-emerald-300" : "border-amber-800/70 bg-amber-950/20 text-amber-300"}`}>
      {children}
    </div>
  );
}

export function CollapsiblePanel({ title, summary, status, open, onToggle, children }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      >
        <span>
          <span className="block font-medium text-zinc-100">{title}</span>
          {summary && <span className="mt-0.5 block text-xs text-zinc-500">{summary}</span>}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {status}
          <span aria-hidden="true" className="text-zinc-400">{open ? "▲" : "▼"}</span>
        </span>
      </button>
      {open && <div className="border-t border-zinc-800 p-4">{children}</div>}
    </div>
  );
}

export function SettingsEmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-700 p-8 text-center">
      <div className="font-medium text-zinc-300">{title}</div>
      {description && <p className="mt-1 text-sm text-zinc-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
