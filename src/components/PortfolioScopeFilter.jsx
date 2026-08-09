import { portfolioScopeOptions } from "../data.js";

export default function PortfolioScopeFilter({ values, onToggle, title, description }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {Object.entries(portfolioScopeOptions).map(([key, scope]) => {
          const enabled = values.includes(key);
          return (
            <button
              key={key}
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => onToggle(key)}
              title={scope.description}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${enabled ? "border-blue-500 bg-blue-950/50 text-blue-100" : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              <span data-switch-track aria-hidden="true" className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-zinc-600"}`}>
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
              </span>
              {scope.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
