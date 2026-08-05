import { useMemo, useState } from "react";
import { annualIncomeSummary } from "../data.js";
import { formatCurrency, mkId } from "../utils.js";
import AddBtn from "./AddBtn.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Modal from "./Modal.jsx";
import NumberInput, { MoneyInput } from "./NumberInput.jsx";
import UndoToast from "./UndoToast.jsx";

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
  const [deleteRequested, setDeleteRequested] = useState(false);
  const summary = annualIncomeSummary([draft]);
  const assetError = draft.assetId ? "" : "Select the asset that generated this income.";
  const year = Number(draft.year);
  const yearError = Number.isInteger(year) && year >= 1900 && year <= new Date().getFullYear() + 1 ? "" : "Enter a valid calendar year.";
  const dirty = JSON.stringify(draft) !== JSON.stringify(record);

  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    if (assetError || yearError) return;
    onSave({
      ...draft,
      id: draft.id || mkId(),
      year,
      ...Object.fromEntries([...incomeFields, ...costFields].map(([key]) => [key, Number(draft[key])])),
    });
  }

  return (
    <>
      <Modal
        open
        title={record.id ? "Edit annual income" : "Add annual income"}
        description="Record yearly totals instead of entering every payment."
        onClose={onClose}
        dirty={dirty}
        onSubmit={submit}
        size="max-w-3xl"
        deleteAction={record.id ? <button type="button" onClick={() => setDeleteRequested(true)} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">🗑️ Delete income record</button> : null}
        primaryAction={<button type="submit" disabled={!!assetError || !!yearError} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{record.id ? "Save record" : "Add record"}</button>}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="text-zinc-400">Asset<span className="text-amber-400"> *</span></span>
              <select autoFocus value={draft.assetId} onChange={(event) => set("assetId", event.target.value)} className={`mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 ${assetError ? "border-red-700" : "border-zinc-800"}`}>
                <option value="">Select asset</option>
                {assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
              </select>
              {assetError && <span className="mt-1 block text-xs text-red-400">{assetError}</span>}
            </label>
            <NumberInput label="Calendar year" kind="year" min={1900} max={new Date().getFullYear() + 1} precision={0} value={draft.year} onChange={(value) => set("year", value)} externalError={yearError} />
          </div>
          <section>
            <h3 className="mb-2 text-sm font-medium">Gross income ({currency})</h3>
            <div className="grid grid-cols-3 gap-3">
              {incomeFields.map(([key, label]) => <MoneyInput key={key} label={label} currency={currency} value={draft[key]} onChange={(value) => set(key, value)} />)}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-medium">Costs ({currency})</h3>
            <div className="grid grid-cols-3 gap-3">
              {costFields.map(([key, label]) => <MoneyInput key={key} label={label} currency={currency} value={draft[key]} onChange={(value) => set(key, value)} />)}
            </div>
          </section>
          <div className="flex justify-between rounded-xl border border-zinc-800 p-3 text-sm"><span>Net annual income</span><strong>{formatCurrency(summary.net, currency)}</strong></div>
        </div>
      </Modal>
      <ConfirmModal
        open={deleteRequested}
        title="Delete annual income record?"
        message={`Delete the ${record.year} income record for ${assets.find((asset) => asset.id === record.assetId)?.name || "this asset"}?`}
        onCancel={() => setDeleteRequested(false)}
        onConfirm={() => { setDeleteRequested(false); onDelete(record.id); }}
      />
    </>
  );
}

export default function IncomeSection({ records, setRecords, assets, currency }) {
  const years = Array.from(new Set([new Date().getFullYear(), ...(records || []).map((record) => Number(record.year))])).sort((a, b) => b - a);
  const [year, setYear] = useState(years[0]);
  const [editing, setEditing] = useState(null);
  const [sort, setSort] = useState({ key: "asset", asc: true });
  const [undo, setUndo] = useState(null);
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
    setRecords((current) => current.some((item) => item.id === record.id) ? current.map((item) => item.id === record.id ? record : item) : [...current, record]);
    setEditing(null);
    setYear(record.year);
  }

  function remove(id) {
    const index = records.findIndex((record) => record.id === id);
    if (index < 0) return;
    setUndo({ record: records[index], index });
    setRecords((current) => current.filter((record) => record.id !== id));
    setEditing(null);
  }

  function heading(label, key) {
    return <th onClick={() => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true })} className={`cursor-pointer py-2 ${key === "asset" ? "text-left" : "text-right"}`}>{label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}</th>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <select value={year} onChange={(event) => setYear(Number(event.target.value))} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm">{years.map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <AddBtn title="Add annual income" onClick={() => setEditing({ ...emptyRecord, year, assetId: assets[0]?.id || "" })} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Gross</div><div>{formatCurrency(summary.gross, currency)}</div></div>
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Costs</div><div>{formatCurrency(summary.costs, currency)}</div></div>
        <div className="rounded-xl border border-zinc-800 p-3"><div className="text-xs text-zinc-500">Net</div><div>{formatCurrency(summary.net, currency)}</div></div>
      </div>
      <table className="w-full text-sm">
        <thead className="text-zinc-400"><tr>{heading("Asset", "asset")}{heading("Gross", "gross")}{heading("Costs", "costs")}{heading("Net", "net")}<th className="w-20 py-2 text-right">Edit</th></tr></thead>
        <tbody>{filtered.map((record) => (
          <tr key={record.id} className="border-t border-zinc-800" onDoubleClick={() => setEditing(record)} title="Double-click to edit">
            <td className="py-2">{record.asset}</td><td className="py-2 text-right">{formatCurrency(record.gross, currency)}</td><td className="py-2 text-right">{formatCurrency(record.costs, currency)}</td><td className="py-2 text-right">{formatCurrency(record.net, currency)}</td>
            <td className="py-2 text-right"><button type="button" onClick={() => setEditing(record)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700">Edit</button></td>
          </tr>
        ))}</tbody>
      </table>
      {!filtered.length && <div className="py-4 text-center text-sm text-zinc-500">No annual income recorded for {year}.</div>}
      {editing && <IncomeModal record={editing} assets={assets} currency={currency} onClose={() => setEditing(null)} onSave={save} onDelete={remove} />}
      <UndoToast message={undo ? "Income record deleted." : ""} onUndo={() => { if (!undo) return; setRecords((current) => [...current.slice(0, undo.index), undo.record, ...current.slice(undo.index)]); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </div>
  );
}
