import { useEffect, useMemo, useRef, useState } from "react";

function separators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === "group")?.value || ",",
    decimal: parts.find((part) => part.type === "decimal")?.value || ".",
  };
}

export function parseNumericInput(input, locale) {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const original = String(input ?? "").trim();
  if (!original) return null;
  const { decimal } = separators(locale);
  let normalized = original
    .replace(/[\s\u00a0\u202f']/g, "")
    .replace(/[€$£¥%]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    const decimalCharacter = comma > dot ? "," : ".";
    const groupingCharacter = decimalCharacter === "," ? "." : ",";
    normalized = normalized.split(groupingCharacter).join("").replace(decimalCharacter, ".");
  } else if (comma >= 0) {
    const parts = normalized.split(",");
    const looksGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3) && decimal !== ",";
    normalized = looksGrouped ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`;
  } else if ((normalized.match(/\./g) || []).length > 1) {
    const parts = normalized.split(".");
    normalized = parts.slice(0, -1).join("") + "." + parts.at(-1);
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function validateNumericValue(value, { min, max, required = true, label = "Value" } = {}) {
  if (value == null) return required ? `${label} is required.` : "";
  if (!Number.isFinite(value)) return `${label} must be a valid number.`;
  if (min != null && value < min) return `${label} must be at least ${min}.`;
  if (max != null && value > max) return `${label} must be no more than ${max}.`;
  return "";
}

export function numericDraftResult(draft, options = {}) {
  const parsed = parseNumericInput(draft, options.locale);
  const error = validateNumericValue(parsed, options);
  if (error) return { value: null, error };
  if (parsed == null) return { value: "", error: "" };
  return { value: options.precision == null ? parsed : Number(parsed.toFixed(options.precision)), error: "" };
}

export function formatNumericValue(value, { kind = "number", currency = "EUR", precision, locale } = {}) {
  if (value === "" || value == null) return "";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "";
  const defaults = { money: 2, percent: 2, quantity: 6, fx: 6, year: 0, number: 2 };
  const digits = precision ?? defaults[kind] ?? 2;
  const options = {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
    useGrouping: kind !== "year",
  };
  if (kind === "money") {
    options.style = "currency";
    options.currency = currency;
  }
  try {
    const formatted = new Intl.NumberFormat(locale, options).format(number);
    return kind === "percent" ? `${formatted}%` : formatted;
  } catch {
    const formatted = number.toLocaleString(locale, { maximumFractionDigits: digits });
    return kind === "money" ? `${formatted} ${currency}` : kind === "percent" ? `${formatted}%` : formatted;
  }
}

function rawValue(value) {
  return value === "" || value == null ? "" : String(value);
}

export default function NumberInput({
  label,
  value,
  onChange,
  kind = "number",
  currency = "EUR",
  min,
  max,
  precision,
  required = true,
  disabled = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
  externalError = "",
  warning = "",
  onValidityChange,
  onEditingChange,
  onCommit,
  placeholder = "",
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => rawValue(value));
  const [internalError, setInternalError] = useState("");
  const skipNextBlur = useRef(false);
  const error = externalError || internalError;

  useEffect(() => {
    if (!editing) setDraft(rawValue(value));
  }, [value, editing]);

  useEffect(() => {
    onValidityChange?.(!error);
  }, [error, onValidityChange]);

  const display = useMemo(() => formatNumericValue(value, { kind, currency, precision }), [value, kind, currency, precision]);

  function finish({ cancel = false, element } = {}) {
    if (cancel) {
      setDraft(rawValue(value));
      setInternalError("");
      setEditing(false);
      onEditingChange?.(false);
      element?.setCustomValidity("");
      return true;
    }
    const result = numericDraftResult(draft, { min, max, required, label, precision });
    const nextError = result.error;
    setInternalError(nextError);
    element?.setCustomValidity(nextError);
    if (nextError) return false;
    const next = result.value;
    onChange(next);
    onCommit?.(next);
    setDraft(rawValue(next));
    setEditing(false);
    onEditingChange?.(false);
    return true;
  }

  return (
    <label className={`block text-sm ${className}`}>
      <span className="text-zinc-400">{label}{required ? <span className="text-amber-400"> *</span> : null}</span>
      <input
        type="text"
        inputMode={kind === "year" ? "numeric" : "decimal"}
        value={editing ? draft : display}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        onFocus={(event) => {
          setEditing(true);
          setDraft(rawValue(value));
          setInternalError("");
          onEditingChange?.(true);
          if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(() => event.target.select());
          else event.target.select();
        }}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          const nextError = validateNumericValue(parseNumericInput(nextDraft), { min, max, required, label });
          event.currentTarget.setCustomValidity(nextError);
          setInternalError(nextError);
        }}
        onBlur={(event) => {
          if (skipNextBlur.current) {
            skipNextBlur.current = false;
            return;
          }
          finish({ element: event.currentTarget });
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (finish({ element: event.currentTarget })) {
              skipNextBlur.current = true;
              event.currentTarget.blur();
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            skipNextBlur.current = true;
            finish({ cancel: true, element: event.currentTarget });
            event.currentTarget.blur();
          }
        }}
        onWheel={(event) => event.currentTarget.blur()}
        className={`mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 ${error ? "border-red-700 focus:ring-red-600" : editing ? "border-blue-600 focus:ring-blue-500" : "border-zinc-800 focus:ring-blue-500"} disabled:cursor-not-allowed disabled:opacity-60 ${inputClassName}`}
        data-invalid={error ? "true" : undefined}
      />
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : warning ? <span className="mt-1 block text-xs text-amber-400">{warning}</span> : null}
    </label>
  );
}

export function MoneyInput(props) {
  return <NumberInput kind="money" min={0} precision={2} {...props} />;
}

export function PercentageInput(props) {
  return <NumberInput kind="percent" min={0} max={100} precision={2} {...props} />;
}

export function QuantityInput(props) {
  return <NumberInput kind="quantity" min={0} precision={6} {...props} />;
}

export function FxRateInput(props) {
  return <NumberInput kind="fx" min={0.000001} precision={6} {...props} />;
}
