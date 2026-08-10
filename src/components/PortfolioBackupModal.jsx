import { useEffect, useState } from "react";
import Modal from "./Modal.jsx";
import TextInput from "./TextInput.jsx";

export default function PortfolioBackupModal({
  open,
  initialMode = "export",
  allowExport = true,
  defaultPassword = "",
  loading = false,
  error = "",
  hasUnsavedChanges = false,
  onClose,
  onExport,
  onImport,
}) {
  const [mode, setMode] = useState(initialMode);
  const [format, setFormat] = useState("encrypted");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [file, setFile] = useState(null);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;
    const nextMode = allowExport ? initialMode : "import";
    setMode(nextMode);
    setFormat("encrypted");
    setPassword(nextMode === "export" ? defaultPassword : "");
    setConfirmation(nextMode === "export" ? defaultPassword : "");
    setFile(null);
    setValidationError("");
  }, [open, initialMode, allowExport, defaultPassword]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword(nextMode === "export" ? defaultPassword : "");
    setConfirmation(nextMode === "export" ? defaultPassword : "");
    setFile(null);
    setValidationError("");
  }

  async function submit(event) {
    event.preventDefault();
    setValidationError("");
    if (mode === "export") {
      if (format === "encrypted" && !password) return setValidationError("Enter a password for the encrypted backup.");
      if (format === "encrypted" && password !== confirmation) return setValidationError("The backup passwords do not match.");
      const success = await onExport?.(format, format === "encrypted" ? password : "");
      if (success !== false) onClose?.();
      return;
    }
    if (!file) return setValidationError("Select an encrypted or JSON portfolio backup.");
    if (file.name?.toLowerCase().endsWith(".enc") && !password) return setValidationError("Enter the password for this encrypted backup.");
    const success = await onImport?.(file, password);
    if (success !== false) onClose?.();
  }

  const encryptedExport = mode === "export" && format === "encrypted";
  return (
    <Modal
      open={open}
      title="Portfolio backup"
      description="Export the current in-memory portfolio or restore a previous backup."
      onClose={onClose}
      onSubmit={submit}
      size="max-w-xl"
      primaryAction={<button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{loading ? "Working…" : mode === "export" ? "Export backup" : "Import backup"}</button>}
    >
      <div className="space-y-5">
        {allowExport && (
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-zinc-950 p-1" role="tablist" aria-label="Backup operation">
            {[
              ["export", "Export"],
              ["import", "Import"],
            ].map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={mode === key} onClick={() => changeMode(key)} className={`rounded-md px-3 py-2 text-sm ${mode === key ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800"}`}>{label}</button>
            ))}
          </div>
        )}

        {mode === "export" ? (
          <>
            <fieldset>
              <legend className="text-sm text-zinc-400">Backup format</legend>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <label className={`cursor-pointer rounded-lg border p-3 ${format === "encrypted" ? "border-blue-500 bg-blue-950/30" : "border-zinc-800 bg-zinc-950/40"}`}>
                  <input type="radio" name="backup-format" value="encrypted" checked={format === "encrypted"} onChange={() => setFormat("encrypted")} className="mr-2" />
                  <span className="font-medium">Encrypted (.enc)</span>
                  <span className="mt-1 block text-xs text-zinc-500">Protected by a backup password.</span>
                </label>
                <label className={`cursor-pointer rounded-lg border p-3 ${format === "json" ? "border-blue-500 bg-blue-950/30" : "border-zinc-800 bg-zinc-950/40"}`}>
                  <input type="radio" name="backup-format" value="json" checked={format === "json"} onChange={() => setFormat("json")} className="mr-2" />
                  <span className="font-medium">Readable JSON (.json)</span>
                  <span className="mt-1 block text-xs text-zinc-500">Portable and editable, but not encrypted.</span>
                </label>
              </div>
            </fieldset>
            {encryptedExport ? (
              <div className="grid gap-3 md:grid-cols-2">
                <TextInput label="Backup password" type="password" value={password} onChange={setPassword} required />
                <TextInput label="Confirm password" type="password" value={confirmation} onChange={setConfirmation} required />
              </div>
            ) : (
              <div className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-3 text-sm text-amber-200">JSON backups contain all portfolio data in readable text. Store them somewhere private.</div>
            )}
          </>
        ) : (
          <>
            {hasUnsavedChanges && <div className="rounded-lg border border-amber-900/70 bg-amber-950/20 p-3 text-sm text-amber-200">The active portfolio has unsaved changes. Export them first if you may need to return to them.</div>}
            <label className="block text-sm">
              <span className="text-zinc-400">Portfolio backup <span className="text-amber-400">*</span></span>
              <input type="file" accept=".enc,.json,application/octet-stream,application/json" onChange={(event) => { setFile(event.target.files?.[0] || null); setValidationError(""); }} className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-zinc-200 hover:file:bg-zinc-700" />
            </label>
            <TextInput label="Password (encrypted backups only)" type="password" value={password} onChange={setPassword} />
            <p className="text-xs text-zinc-500">The format is detected from the file contents. Import replaces the portfolio in memory; the current local or Drive file is not overwritten until you explicitly Save.</p>
          </>
        )}

        {(validationError || error) && <div className="rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{validationError || error}</div>}
      </div>
    </Modal>
  );
}
