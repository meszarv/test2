export default function TextInput({ label, value, onChange, type = "text", placeholder = "", className = "", disabled = false }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-zinc-400">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  );
}
