import { useEffect, useMemo, useState } from "react";
import TextInput from "./TextInput.jsx";

export const commonCurrencies = ["EUR", "USD", "GBP", "CHF", "CZK", "PLN", "HUF", "JPY", "CAD", "AUD"];

export function normalizeCurrencyCode(value) {
  return String(value || "").trim().toUpperCase();
}

export function currencyError(value) {
  const code = normalizeCurrencyCode(value);
  if (!/^[A-Z]{3}$/.test(code)) return "Enter a three-letter currency code.";
  try {
    new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(1);
    return "";
  } catch {
    return "This currency code is not supported by your browser.";
  }
}

export default function CurrencySelect({ label = "Currency", value, onChange, referencedCurrencies = [], disabled = false }) {
  const normalized = normalizeCurrencyCode(value);
  const options = useMemo(() => Array.from(new Set([
    ...commonCurrencies,
    ...referencedCurrencies.map(normalizeCurrencyCode).filter((code) => /^[A-Z]{3}$/.test(code)),
  ])), [referencedCurrencies.join("|")]);
  const isOther = !!normalized && !options.includes(normalized);
  const [customOpen, setCustomOpen] = useState(isOther || !normalized);
  const [customCode, setCustomCode] = useState(isOther ? normalized : "");
  const error = customOpen ? currencyError(customCode) : "";

  useEffect(() => {
    if (isOther) {
      setCustomOpen(true);
      setCustomCode(normalized);
    }
  }, [isOther, normalized]);

  function select(next) {
    if (next === "__other") {
      setCustomOpen(true);
      if (options.includes(normalized)) setCustomCode("");
      return;
    }
    setCustomOpen(false);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm">
        <span className="text-zinc-400">{label}<span className="text-amber-400"> *</span></span>
        <select
          value={customOpen ? "__other" : normalized}
          onChange={(event) => select(event.target.value)}
          disabled={disabled}
          className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {options.map((code) => <option key={code} value={code}>{code}</option>)}
          <option value="__other">Other…</option>
        </select>
      </label>
      {customOpen && (
        <TextInput
          label="Custom currency code"
          value={customCode}
          onChange={(next) => {
            const code = normalizeCurrencyCode(next);
            setCustomCode(code);
            if (!currencyError(code)) onChange(code);
          }}
          placeholder="e.g. SEK"
          error={error}
          disabled={disabled}
          required
          inputClassName="w-40 uppercase"
        />
      )}
    </div>
  );
}
