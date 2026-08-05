import { useEffect } from "react";

export default function UndoToast({ message, onUndo, onDismiss, duration = 6000 }) {
  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => onDismiss?.(), duration);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, duration]);
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm shadow-2xl">
      <span>{message}</span>
      <button type="button" onClick={onUndo} className="font-medium text-blue-400 hover:text-blue-300">Undo</button>
      <button type="button" onClick={onDismiss} className="text-zinc-500 hover:text-zinc-300">Dismiss</button>
    </div>
  );
}
