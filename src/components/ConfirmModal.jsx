import Modal from "./Modal.jsx";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  destructive = true,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      size="max-w-sm"
      zIndex="z-[60]"
      primaryAction={(
        <button
          type="button"
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm ${destructive ? "bg-red-700 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-500"}`}
        >
          {destructive ? "🗑️ " : ""}{confirmLabel}
        </button>
      )}
    >
      <p className="text-sm text-zinc-300">{message || "This action cannot be undone after the confirmation window closes."}</p>
    </Modal>
  );
}
