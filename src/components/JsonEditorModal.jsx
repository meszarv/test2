import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";

export default function JsonEditorModal({ open, onClose, data, onSave }) {
  const [text, setText] = useState("");
  const [original, setOriginal] = useState("");

  useEffect(() => {
    if (!open) return;
    const next = JSON.stringify(data, null, 2);
    setText(next);
    setOriginal(next);
  }, [open, data]);

  let valid = true;
  try {
    JSON.parse(text);
  } catch {
    valid = false;
  }

  function handleSave(event) {
    event.preventDefault();
    if (!valid) return;
    onSave(JSON.parse(text));
    onClose();
  }

  return (
    <Modal
      open={open}
      title="Edit portfolio JSON"
      description="Advanced: invalid structural changes can make the portfolio unreadable."
      onClose={onClose}
      dirty={text !== original}
      onSubmit={handleSave}
      size="max-w-4xl"
      zIndex="z-[60]"
      primaryAction={<button type="submit" disabled={!valid} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">Save JSON</button>}
    >
      <textarea autoFocus className="h-[55vh] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100" value={text} onChange={(event) => setText(event.target.value)} />
      {!valid && <div className="mt-2 text-sm text-red-400">Invalid JSON. Correct the syntax before saving.</div>}
    </Modal>
  );
}
