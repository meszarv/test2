import React, { useMemo, useState } from "react";
import { annualIncomeSummary } from "../data.js";
import { formatCurrency, mkId } from "../utils.js";
import AddBtn from "./AddBtn.jsx";
import TextInput from "./TextInput.jsx";

const emptyRecord = {
  id: "",
  assetId: "",
  year: new Date().getFullYear(),
  dividends: 0,
  interest: 0,
  rent: 0,
  distributions: 0,
  otherIncome: 0,
  fees: 0,
  repairs: 0,
  otherCosts: 0,
};

const incomeFields = [
  ["dividends", "Dividends"],
  ["interest", "Interest"],
  ["rent", "Rent"],
  ["distributions", "Distributions"],
  ["otherIncome", "Other income"],
];

const costFields = [
  ["fees", "Fees"],
  ["repairs", "Repairs and maintenance"],
  ["otherCosts", "Other costs"],
];

function IncomeModal({ record, assets, currency, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(record);
  const summary = annualIncomeSummary([draft]);

  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (!draft.assetId) return;
    onSave({
      ...draft,
      id: draft.id || mkId(),
      year: Number(draft.year) || new Date().getFullYear(),
      ...Object.fromEntries([...incomeFields, ...costFields].map(([key]) => [key, Number(draft[key]) || 0])),
    });
  }

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 w-full max-w-2xl max-h-[92vh] overflow-y-auto space-y-4">
        <h2 className="text-lg font-medium">{record.id ? "Edit annual income" : "Add annual income"}</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-zinc-400">Asset</span>
            <select
              autoFocus
              value={draft.assetId}
              onChange={(event) => set("assetId", event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2"
            >
              <option value="">Select asset</option>
              {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
            </select>
          </label>
          <TextInput label="Calendar year" type="number" value={String(draft.year)} onChange={(value) => set("year", value)} />
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Gross income ({currency})</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {incomeFields.map(([key, label]) => (
              <TextInput key={key} label={label} type="number" value={String(draft[key] || 0)} onChange={(value) => set(key, value)} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">Costs ({currency})</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {costFields.map(([key, label]) => (
              <TextInput key={key} label={label} type="number" value={String(draft[key] || 0)} onChange={(value) => set(key, value)} />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 p-3 text-sm flex justify-between">
          <span>Net annual income</span>
          <strong>{formatCurrency(summary.net, currency)}</strong>
        </div>
        <div className="flex justify-between gap-2 pt-2">
          <div>
            {record.id && (
              <button type="button" title="Delete" onClick={() => onDelete(record.id)} className="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600">🗑️</button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" title="Close" onClick={onClose} className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">✖</button>
            <button type="submit" title={record.id ? "Save" : "Add"} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">{record.id ? "💾" : "➕"}</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function IncomeSection({ records, setRecords, assets, currency }) {
  const years = Array.from(new Set([new Date().getFullYear(), ...(records || []).map((record) => Number(record.year))])).sort((a, b) => b - a);
  const [year, setYear] = useState(years[0]);
  const [editing, setEditing] = useState(null);
  const [sort, setSort] = useState({ key: "asset", asc: true });
  const assetMap = useMemo(() => new Map((assets || []).map((asset) => [asset.id, asset.name])), [assets]);
  const filtered = (records || []).filter((record) => Number(record.year) === Number(year)).map((record) => ({
    ...record,
    asset: assetMap.get(record.assetId) || "Unknown asset",
    ...annualIncomeSummary([record]),
  })).sort((left, right) => {
    const a = left[sort.key];
    const b = right[sort.key];
    const comparison = typeof a === "string" ? a.localeCompare(b) : (a || 0) - (b || 0);
    return sort.asc ? comparison : -comparison;
  });
  const summary = annualIncomeSummary(records, year);

  function save(record) {
    setRecords((current) => current.some((item) => item.id === record.id)
      ? current.map((item) => item.id === record.id ? record : item)
      : [...current, record]);
    setEditing(null);
    setYear(record.year);
  }

  function remove(id) {
    setRecords((current) => current.filter((record) => record.id !== id));
    setEditing(null);
  }

  function heading(label, key) {
    return (
      <th onClick={() => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true })} className={`py-2 cursor-pointer ${key === "asset" ? "text-left" : "text-right"}`}>
        {label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}
      </th>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm">
          {years.map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <AddBtn
          title="Add annual income"
          onClick={() => setEditing({ ...emptyRecord, year, assetId: assets[0]?.id || "" })}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Gross</div><div>{formatCurrency(summary.gross, currency)}</div></div>
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Costs</div><div>{formatCurrency(summary.costs, currency)}</div></div>
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Net</div><div>{formatCurrency(summary.net, currency)}</div></div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-zinc-400"><tr>{heading("Asset", "asset")}{heading("Gross", "gross")}{heading("Costs", "costs")}{heading("Net", "net")}</tr></thead>
        <tbody>
          {filtered.map((record) => (
            <tr key={record.id} className="border-t border-zinc-800" onDoubleClick={() => setEditing(record)} title="Double-click to edit">
              <td className="py-2">{record.asset}</td>
              <td className="py-2 text-right">{formatCurrency(record.gross, currency)}</td>
              <td className="py-2 text-right">{formatCurrency(record.costs, currency)}</td>
              <td className="py-2 text-right">{formatCurrency(record.net, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!filtered.length && <div className="py-4 text-center text-sm text-zinc-500">No annual income recorded for {year}.</div>}
      {editing && <IncomeModal record={editing} assets={assets} currency={currency} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
    </div>
  );
}
