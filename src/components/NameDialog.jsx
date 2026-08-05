import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import TextInput from "./TextInput.jsx";

export default function NameDialog({ open, title, label = "Name", initialValue = "", existingNames = [], onClose, onSave }) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);
  const trimmed = value.trim();
  const duplicate = existingNames.some((name) => name.trim().toLowerCase() === trimmed.toLowerCase() && name !== initialValue);
  const error = !trimmed ? `${label} is required.` : duplicate ? `${label} already exists.` : "";
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      dirty={value !== initialValue}
      onSubmit={(event) => { event.preventDefault(); if (!error) onSave(trimmed); }}
      size="max-w-md"
      primaryAction={<button type="submit" disabled={!!error} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">Add</button>}
    >
      <TextInput autoFocus label={label} value={value} onChange={setValue} error={error} required />
    </Modal>
  );
}
