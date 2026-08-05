import Modal from "./Modal.jsx";

export default function ClosePortfolioModal({ open, canSave, loading, onCancel, onSaveAndClose, onDiscardAndClose }) {
  return (
    <Modal
      open={open}
      title="Close portfolio?"
      description="The portfolio contains changes that have not been saved."
      onClose={onCancel}
      size="max-w-md"
      deleteAction={<button type="button" disabled={loading} onClick={onDiscardAndClose} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600 disabled:opacity-40">Close without saving</button>}
      primaryAction={canSave ? <button type="button" disabled={loading} onClick={onSaveAndClose} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-40">{loading ? "Saving…" : "Save and close"}</button> : null}
    >
      <p className="text-sm text-zinc-300">{canSave ? "Save the latest changes before closing, or close without saving them." : "This sample portfolio has no backing file. Close it to return to the opening screen."}</p>
    </Modal>
  );
}
