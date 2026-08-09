import { useState } from "react";
import ConfirmModal from "./ConfirmModal.jsx";
import Modal from "./Modal.jsx";
import TextInput from "./TextInput.jsx";
import UndoToast from "./UndoToast.jsx";

export function hasSnapshotMonthConflict(snapshots, editingIndex, month) {
  return snapshots.some((snapshot, index) => index !== editingIndex && snapshot.asOf.slice(0, 7) === month);
}

export default function SnapshotTabs({
  snapshots,
  currentIndex,
  onSelect,
  onAdd,
  onChangeDate,
  onDelete,
  onRestore,
}) {
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [original, setOriginal] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [undo, setUndo] = useState(null);

  const fmt = (date) => date.toLocaleString("default", { month: "short", year: "numeric" });
  const currentMonth = new Date().toISOString().slice(0, 7);
  const hasCurrent = snapshots.some((snapshot) => snapshot.asOf.slice(0, 7) === currentMonth);

  function startEdit(index) {
    const snapshot = snapshots[index];
    if (!snapshot) return;
    const next = {
      month: new Date(snapshot.asOf).toISOString().slice(0, 7),
    };
    setEditValue(next.month);
    setOriginal(next);
    setEditIndex(index);
  }

  const duplicateMonth = editIndex != null && hasSnapshotMonthConflict(snapshots, editIndex, editValue);
  const dirty = original && editValue !== original.month;

  function save(event) {
    event.preventDefault();
    if (!editValue || duplicateMonth) return;
    const [year, month] = editValue.split("-");
    onChangeDate(editIndex, new Date(Number(year), Number(month) - 1, 1));
    setEditIndex(null);
  }

  function confirmDelete() {
    const index = deleteIndex;
    const snapshot = snapshots[index];
    if (snapshot) setUndo({ snapshot, index });
    onDelete?.(index);
    setDeleteIndex(null);
    setEditIndex(null);
  }

  return (
    <>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {snapshots.map((snapshot, index) => ({ snapshot, index })).sort((left, right) => new Date(left.snapshot.asOf) - new Date(right.snapshot.asOf)).map(({ snapshot, index }) => (
          <button
            type="button"
            key={snapshot.asOf}
            onClick={() => onSelect(index)}
            onDoubleClick={() => startEdit(index)}
            className={`rounded-lg border px-3 py-1.5 ${index === currentIndex ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"}`}
            title="Double-click to edit check-in"
          >
            {fmt(new Date(snapshot.asOf))}
          </button>
        ))}
        {!hasCurrent && <button type="button" onClick={onAdd} className="rounded-lg border border-dashed border-blue-600 bg-blue-950/20 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-950/40">＋ New check-in</button>}
        {snapshots[currentIndex] && <button type="button" onClick={() => startEdit(currentIndex)} className="ml-auto rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700">Edit selected check-in</button>}
      </div>
      <div className="mb-4 flex items-center justify-between text-xs text-zinc-500">
        <span>One check-in is allowed per calendar month.</span>
        <span>{currentIndex === snapshots.length - 1 ? "Latest check-in · editable" : "Historical check-in · read-only"}</span>
      </div>

      <Modal
        open={editIndex !== null}
        title="Edit check-in"
        description="Change the month represented by this state snapshot."
        onClose={() => setEditIndex(null)}
        dirty={!!dirty}
        onSubmit={save}
        size="max-w-lg"
        deleteAction={<button type="button" onClick={() => setDeleteIndex(editIndex)} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">🗑️ Delete check-in</button>}
        primaryAction={<button type="submit" disabled={!editValue || duplicateMonth} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">Save check-in</button>}
      >
        <TextInput autoFocus label="Month" type="month" value={editValue} onChange={setEditValue} error={duplicateMonth ? "A check-in already exists for this month." : ""} required />
      </Modal>
      <ConfirmModal open={deleteIndex !== null} title="Delete check-in?" message={deleteIndex == null ? "" : `Delete the ${fmt(new Date(snapshots[deleteIndex]?.asOf))} check-in and its recorded portfolio history?`} onConfirm={confirmDelete} onCancel={() => setDeleteIndex(null)} />
      <UndoToast message={undo ? "Check-in deleted." : ""} onUndo={() => { if (!undo) return; onRestore?.(undo.snapshot, undo.index); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </>
  );
}
