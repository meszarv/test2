export default function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  inputClassName = "",
  disabled = false,
  autoFocus = false,
  onKeyDown,
  onBlur,
  error = "",
  required = false,
}) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-zinc-400">{label}{required ? <span className="text-amber-400"> *</span> : null}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        autoFocus={autoFocus}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        required={required}
        className={`mt-1 rounded-lg bg-zinc-900 border px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 ${error ? "border-red-700 focus:ring-red-600" : "border-zinc-800 focus:ring-blue-500"} ${inputClassName || "w-full"}`}
      />
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}
