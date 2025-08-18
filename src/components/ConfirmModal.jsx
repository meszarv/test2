import React from "react";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-sm space-y-3">
        {title && <h2 className="text-lg font-medium">{title}</h2>}
        {message && <p className="text-sm">{message}</p>}
        <div className="flex justify-between gap-2 pt-2">
          <button
            onClick={onConfirm}
            title="Delete"
            className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
          >
            🗑️
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              title="Close"
              className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
            >
              ✖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
