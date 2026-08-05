import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import { MoneyInput } from "./NumberInput.jsx";
import TextInput from "./TextInput.jsx";

const emptyLiability = { name: "", type: "", description: "", value: 0, priority: false };

export default function LiabilityFormModal({ open, liability, onClose, liabilityTypes, currency = "EUR", onSave, onDelete }) {
  const firstType = Object.keys(liabilityTypes)[0] || "";
  const makeInitial = () => liability
    ? { ...liability, name: liability.name || "", type: liability.type || firstType, description: liability.description || "", value: Number(liability.value) || 0, priority: !!liability.priority }
    : { ...emptyLiability, type: firstType };
  const [draft, setDraft] = useState(makeInitial);
  const [original, setOriginal] = useState(makeInitial);

  useEffect(() => {
    if (!open) return;
    const next = makeInitial();
    setDraft(next);
    setOriginal(next);
  }, [open, liability, liabilityTypes]);

  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  const nameError = draft.name.trim() ? "" : "Liability name is required.";
  const valueError = Number(draft.value) >= 0 ? "" : "Liability value cannot be negative.";
  const valid = !!draft.type && !nameError && !valueError;
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);

  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    onSave({ ...draft, name: draft.name.trim(), value: Number(draft.value) });
    onClose();
  }

  return (
    <Modal
      open={open}
      title={liability ? "Edit liability" : "Add liability"}
      description="Liabilities are tracked as a simplified current balance."
      onClose={onClose}
      dirty={dirty}
      onSubmit={submit}
      size="max-w-lg"
      deleteAction={liability && onDelete ? <button type="button" onClick={() => onDelete(liability)} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">🗑️ Delete liability</button> : null}
      primaryAction={<button type="submit" disabled={!valid} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{liability ? "Save liability" : "Add liability"}</button>}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TextInput autoFocus required label="Name" value={draft.name} onChange={(value) => set("name", value)} error={nameError} />
          <label className="block text-sm">
            <span className="text-zinc-400">Type</span>
            <select className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100" value={draft.type} onChange={(event) => set("type", event.target.value)}>
              {Object.entries(liabilityTypes).map(([key, definition]) => <option key={key} value={key}>{definition?.name || key}</option>)}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-zinc-400">Description</span>
          <textarea className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100" rows="3" value={draft.description} onChange={(event) => set("description", event.target.value)} />
        </label>
        <MoneyInput label={`Current balance (${currency})`} currency={currency} value={draft.value} onChange={(value) => set("value", value)} externalError={valueError} />
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" className="mt-0.5" checked={draft.priority} onChange={(event) => set("priority", event.target.checked)} />
          <span><span className="block">Priority debt</span><span className="mt-1 block text-xs text-zinc-500">Mark only debts that should be considered before additional investments.</span></span>
        </label>
      </div>
    </Modal>
  );
}
