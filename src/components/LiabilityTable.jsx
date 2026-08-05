import { useState } from "react";
import { formatCurrency } from "../utils.js";
import NumberInput from "./NumberInput.jsx";
import UndoToast from "./UndoToast.jsx";

export default function LiabilityTable({ liabilities, prevLiabilities, setLiabilities, liabilityTypes, currency = "EUR", readOnly = false, onEdit }) {
  const [sort, setSort] = useState({ key: null, asc: true });
  const [undo, setUndo] = useState(null);
  const prevMap = new Map((prevLiabilities || []).map((liability) => [liability.id, Number(liability.value) || 0]));

  function updateValue(id, value) {
    if (readOnly) return;
    const previous = liabilities.find((liability) => liability.id === id);
    if (!previous || Number(previous.value) === Number(value)) return;
    setUndo({ liability: previous, message: `${previous.name}: balance updated.` });
    setLiabilities(liabilities.map((liability) => liability.id === id ? { ...liability, value } : liability));
  }

  function updatePriority(id, priority) {
    if (readOnly) return;
    setLiabilities(liabilities.map((liability) => liability.id === id ? { ...liability, priority } : liability));
  }

  const sortedLiabilities = [...liabilities];
  if (sort.key) {
    sortedLiabilities.sort((left, right) => {
      let a = left[sort.key];
      let b = right[sort.key];
      if (sort.key === "value") { a = Number(a) || 0; b = Number(b) || 0; }
      else if (sort.key === "type") { a = liabilityTypes[a]?.name || a; b = liabilityTypes[b]?.name || b; }
      else { a = (a || "").toString(); b = (b || "").toString(); }
      if (typeof a === "string") return sort.asc ? a.localeCompare(b) : b.localeCompare(a);
      return sort.asc ? a - b : b - a;
    });
  }

  function heading(label, key, align = "left") {
    return <th className={`${align === "right" ? "text-right" : "text-left"} cursor-pointer p-2`} onClick={() => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true })}>{label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}</th>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="text-zinc-400"><tr><th className="p-2">Priority</th>{heading("Name", "name")}{heading("Type", "type")}{heading("Description", "description")}{heading("Value", "value", "right")}<th className="w-20 p-2 text-right">Edit</th></tr></thead>
        <tbody>{sortedLiabilities.map((liability) => {
          const previous = prevMap.get(liability.id) || 0;
          const delta = (Number(liability.value) || 0) - previous;
          return (
            <tr key={liability.id} className="border-t border-zinc-800" onDoubleClick={() => !readOnly && onEdit?.(liability)} title={readOnly ? "Historical snapshot" : "Double-click to edit"}>
              <td className="p-2 text-center"><input type="checkbox" checked={!!liability.priority} onChange={(event) => updatePriority(liability.id, event.target.checked)} disabled={readOnly} /></td>
              <td className="p-2">{liability.name}</td><td className="p-2">{liabilityTypes[liability.type]?.name || liability.type}</td><td className="whitespace-pre-line p-2 text-xs">{liability.description}</td>
              <td className="p-2 text-right"><div className="flex items-center justify-end gap-2">{readOnly ? <span>{formatCurrency(liability.value, currency)}</span> : <NumberInput label={`${liability.name} balance`} kind="money" currency={currency} min={0} precision={2} value={liability.value} onChange={(value) => updateValue(liability.id, value)} className="w-36 [&>span:first-child]:sr-only" inputClassName="border-transparent bg-transparent px-1 py-1 text-right hover:border-zinc-700 focus:bg-zinc-800" />}{delta ? <span className={`text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>({formatCurrency(delta, currency)})</span> : null}</div></td>
              <td className="p-2 text-right">{readOnly ? "—" : <button type="button" onClick={() => onEdit?.(liability)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700">Edit</button>}</td>
            </tr>
          );
        })}</tbody>
      </table>
      {!liabilities.length && <div className="py-5 text-center text-sm text-zinc-500">No liabilities in this snapshot.</div>}
      <UndoToast message={undo?.message || ""} onUndo={() => { if (!undo) return; setLiabilities(liabilities.map((liability) => liability.id === undo.liability.id ? undo.liability : liability)); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </div>
  );
}
