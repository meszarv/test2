import React, { useState } from "react";
import { formatCurrency } from "../utils.js";
import { netWorth } from "../data.js";

export default function HistorySidebar({ snapshots, currentIndex, onSelect }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`fixed top-0 right-0 h-full bg-zinc-900 border-l border-zinc-800 transition-all ${open ? "w-64" : "w-0"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="absolute left-[-32px] top-4 bg-zinc-800 border border-zinc-700 rounded-l-lg px-2 py-1 text-sm"
      >
        {open ? "→" : "←"}
      </button>
      {open && (
        <div className="p-4 overflow-y-auto h-full">
          <h3 className="text-sm text-zinc-400 mb-2">History</h3>
          <ul className="space-y-1 text-sm">
            {snapshots.map((s, i) => (
              <li key={i}>
                <button
                  onClick={() => onSelect(i)}
                  className={`w-full text-left hover:underline ${i === currentIndex ? "text-blue-400" : "text-zinc-200"}`}
                >
                  {new Date(s.asOf).toISOString().slice(0, 10)} — {formatCurrency(netWorth(s.assets || []))}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
