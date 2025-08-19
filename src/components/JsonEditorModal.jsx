import { useEffect, useState } from "react";

export default function JsonEditorModal({ open, onClose, data, onSave }) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (open) {
      setText(JSON.stringify(data, null, 2));
    }
  }, [open, data]);

  let valid = true;
  try {
    JSON.parse(text);
  } catch {
    valid = false;
  }

  function handleSave() {
    if (!valid) return;
    const parsed = JSON.parse(text);
    onSave(parsed);
    onClose();
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl p-4 w-full max-w-3xl space-y-3">
        <h2 className="text-lg font-medium">Edit JSON</h2>
        <textarea
          className="w-full h-64 rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {!valid && <div className="text-red-500 text-sm">Invalid JSON</div>}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            title="Close"
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
          >
            ✖
          </button>
          <button
            type="button"
            onClick={handleSave}
            title="Save"
            disabled={!valid}
            className={`px-3 py-2 rounded-lg ${valid ? "bg-blue-600 hover:bg-blue-500" : "bg-zinc-700 text-zinc-400 cursor-not-allowed"}`}
          >
            💾
          </button>
        </div>
      </div>
    </div>
  );
}
