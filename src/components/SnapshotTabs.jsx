import React, { useState } from "react";
import TextInput from "./TextInput.jsx";
import ConfirmModal from "./ConfirmModal.jsx";

export default function SnapshotTabs({
  snapshots,
  currentIndex,
  onSelect,
  onAdd,
  onChangeDate,
  onChangeCashFlow,
  onDelete,
  currency = "EUR",
}) {
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [contributions, setContributions] = useState("");
  const [withdrawals, setWithdrawals] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);

  const fmt = (d) => d.toLocaleString("default", { month: "short", year: "numeric" });
  const hasCurrent = snapshots.some((s) => s.asOf.slice(0, 7) === new Date().toISOString().slice(0, 7));

  function startEdit(idx) {
    const snap = snapshots[idx];
    if (!snap) return;
    const val = new Date(snap.asOf).toISOString().slice(0, 7);
    setEditValue(val);
    setContributions(String(snap.contributions || ""));
    setWithdrawals(String(snap.withdrawals || ""));
    setEditIndex(idx);
  }

  function saveDate() {
    const [y, m] = editValue.split("-");
    const date = new Date(Number(y), Number(m) - 1, 1);
    onChangeDate(editIndex, date);
    if (onChangeCashFlow) onChangeCashFlow(editIndex, contributions, withdrawals);
    setEditIndex(null);
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        {snapshots
          .map((s, i) => ({ s, i }))
          .sort((a, b) => new Date(a.s.asOf) - new Date(b.s.asOf))
          .map(({ s, i }) => (
            <button
              key={s.asOf}
              onClick={() => onSelect(i)}
              onDoubleClick={() => startEdit(i)}
              className={`px-3 py-1 rounded-t border border-zinc-700 ${
                i === currentIndex ? "bg-zinc-800 border-b-zinc-950" : "bg-zinc-900 hover:bg-zinc-800"
              }`}
            >
              {fmt(new Date(s.asOf))}
            </button>
          ))}
        {!hasCurrent && (
          <button
            onClick={onAdd}
            className="px-3 py-1 rounded-t border-2 border-dashed border-zinc-700 bg-zinc-900 hover:bg-zinc-800"
          >
            {fmt(new Date())}
          </button>
        )}
      </div>
      {editIndex !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
            <h2 className="text-lg font-medium">Edit snapshot date</h2>
            <TextInput
              label="Month"
              type="month"
              value={editValue}
              onChange={setEditValue}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") saveDate();
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label={`External contributions (${currency})`}
                type="number"
                value={contributions}
                onChange={setContributions}
              />
              <TextInput
                label={`External withdrawals (${currency})`}
                type="number"
                value={withdrawals}
                onChange={setWithdrawals}
              />
            </div>
            <p className="text-xs text-zinc-500">
              Optional totals used to separate portfolio growth from money added or withdrawn.
            </p>
            <div className="flex justify-between gap-2 pt-2">
              <button
                onClick={() => setDeleteIndex(editIndex)}
                title="Delete"
                className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
              >
                🗑️
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditIndex(null)}
                  title="Close"
                  className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                >
                  ✖
                </button>
                <button
                  onClick={saveDate}
                  title="Save"
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
                >
                  ✔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={deleteIndex !== null}
        title="Delete snapshot?"
        onConfirm={() => {
          if (onDelete) onDelete(deleteIndex);
          setDeleteIndex(null);
          setEditIndex(null);
        }}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
