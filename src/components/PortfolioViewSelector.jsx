import { portfolioViews } from "../data.js";

export default function PortfolioViewSelector({ value, onChange, title, description }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-zinc-500">{description}</div>
      </div>
      <div className="flex overflow-hidden rounded-lg border border-zinc-700 text-sm" role="group" aria-label={title}>
        {Object.entries(portfolioViews).map(([key, view]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={value === key}
            className={`px-3 py-2 ${value === key ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`}
          >
            {view.name}
          </button>
        ))}
      </div>
    </div>
  );
}
