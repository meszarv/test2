import { useEffect, useId, useRef, useState } from "react";

const modalStack = [];

export default function Modal({
  open,
  title,
  description,
  onClose,
  dirty = false,
  onSubmit,
  children,
  deleteAction,
  primaryAction,
  secondaryLabel = "Cancel",
  size = "max-w-3xl",
  contentClassName = "p-5",
  zIndex = "z-50",
}) {
  const titleId = useId();
  const stackId = useRef(Symbol("modal"));
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalStack.push(stackId.current);
    return () => {
      const index = modalStack.lastIndexOf(stackId.current);
      if (index >= 0) modalStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function keydown(event) {
      if (event.key !== "Escape" || modalStack.at(-1) !== stackId.current) return;
      event.preventDefault();
      if (confirmDiscard) setConfirmDiscard(false);
      else if (dirty) setConfirmDiscard(true);
      else onClose?.();
    }
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [open, dirty, confirmDiscard, onClose]);

  useEffect(() => {
    if (!open) setConfirmDiscard(false);
  }, [open]);

  if (!open) return null;
  const Container = onSubmit ? "form" : "div";
  const requestClose = () => dirty ? setConfirmDiscard(true) : onClose?.();

  return (
    <div className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/65 p-6`} onMouseDown={(event) => {
      if (event.target === event.currentTarget) requestClose();
    }}>
      <Container
        onSubmit={onSubmit}
        className={`flex max-h-[calc(100vh-3rem)] w-full ${size} flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="shrink-0 border-b border-zinc-800 bg-zinc-900 px-5 py-4">
          <h2 id={titleId} className="text-lg font-medium text-zinc-100">{title}</h2>
          {description && <p className="mt-1 text-xs text-zinc-500">{description}</p>}
        </header>
        <div className={`min-h-0 flex-1 overflow-y-auto ${contentClassName}`}>{children}</div>
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-5 py-4">
          <div>{deleteAction}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={requestClose} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">{secondaryLabel}</button>
            {primaryAction}
          </div>
        </footer>
      </Container>
      {confirmDiscard && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl">
            <h3 className="text-lg font-medium">Discard unsaved changes?</h3>
            <p className="mt-2 text-sm text-zinc-400">Changes made in this dialog have not been applied.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmDiscard(false)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700">Keep editing</button>
              <button type="button" onClick={() => { setConfirmDiscard(false); onClose?.(); }} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">Discard changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
