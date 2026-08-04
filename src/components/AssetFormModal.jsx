import React, { useEffect, useMemo, useState } from "react";
import { applyAssetTypeRules, assetValue, normalizeAsset, portfolioScopeOptions } from "../data.js";
import { formatCurrency, mkAsset } from "../utils.js";
import DimensionExposureEditor from "./DimensionExposureEditor.jsx";
import TextInput from "./TextInput.jsx";

function initialAsset(asset, assetTypes, currency) {
  if (asset) return normalizeAsset(asset, assetTypes);
  const type = Object.keys(assetTypes)[0] || "cash";
  const base = mkAsset(type, assetTypes);
  base.pricingCurrency = currency;
  base.valuationDate = new Date().toISOString().slice(0, 10);
  return applyAssetTypeRules(normalizeAsset(base, assetTypes), assetTypes, true);
}

export default function AssetFormModal({
  open,
  asset,
  onClose,
  assetTypes,
  dimensions,
  currency = "EUR",
  onSave,
  onDelete,
}) {
  const [draft, setDraft] = useState(() => initialAsset(asset, assetTypes, currency));

  useEffect(() => {
    if (open) setDraft(initialAsset(asset, assetTypes, currency));
  }, [open, asset, assetTypes, currency]);

  const calculatedValue = useMemo(() => assetValue(draft), [draft]);

  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function changeType(type) {
    setDraft((previous) => applyAssetTypeRules(normalizeAsset({
      ...previous,
      type,
      isCheckingAccount: type === "cash",
      eligibleForInvestment: type !== "cash" && type !== "real_estate",
    }, assetTypes), assetTypes, true));
  }

  function submit(event) {
    event.preventDefault();
    const normalized = { ...normalizeAsset(draft, assetTypes), scopeNeedsReview: false };
    if (!normalized.name.trim()) return;
    onSave(normalized);
    onClose();
  }

  if (!open) return null;
  const rules = assetTypes[draft.type]?.dimensionRules || {};
  const scopeRule = assetTypes[draft.type]?.scopeRule || { mode: "user", value: "" };

  return (
    <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4">
      <form onSubmit={submit} className="bg-zinc-900 rounded-xl p-5 w-full max-w-4xl max-h-[92vh] overflow-y-auto space-y-5 border border-zinc-800">
        <div>
          <h2 className="text-lg font-medium">{asset ? "Edit asset" : "Add asset"}</h2>
          <p className="text-xs text-zinc-500 mt-1">Current portfolio value: {formatCurrency(calculatedValue, currency)}</p>
        </div>

        {draft.scopeNeedsReview && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-200">
            Review this asset’s portfolio scope. It could not be classified safely during the file upgrade; saving confirms your selection.
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-3">
          <TextInput autoFocus label="Asset name" value={draft.name} onChange={(value) => set("name", value)} />
          <label className="block text-sm">
            <span className="text-zinc-400">Asset type</span>
            <select
              value={draft.type}
              onChange={(event) => changeType(event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            >
              {Object.entries(assetTypes).map(([key, definition]) => (
                <option key={key} value={key}>{definition.name}</option>
              ))}
            </select>
          </label>
          <TextInput label="Description" value={draft.description} onChange={(value) => set("description", value)} />
          <label className="block text-sm">
            <span className="text-zinc-400">Ownership</span>
            <select
              value={draft.ownership}
              onChange={(event) => set("ownership", event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            >
              {Object.entries(dimensions.ownership?.values || {}).map(([key, definition]) => (
                <option key={key} value={key}>{definition.name}</option>
              ))}
            </select>
          </label>
          <TextInput label="Ownership share %" type="number" value={String(draft.ownershipShare)} onChange={(value) => set("ownershipShare", value)} />
          <TextInput label="First acquisition date" type="date" value={draft.acquiredOn} onChange={(value) => set("acquiredOn", value)} />
          <label className="block text-sm">
            <span className="text-zinc-400">Status</span>
            <select
              value={draft.status}
              onChange={(event) => set("status", event.target.value)}
              className="mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100"
            >
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <TextInput label="Pricing currency" value={draft.pricingCurrency} onChange={(value) => set("pricingCurrency", value.toUpperCase())} />
          <TextInput label="Valuation date" type="date" value={draft.valuationDate} onChange={(value) => set("valuationDate", value)} />
        </div>

        <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium">Portfolio scope</h3>
              <p className="text-xs text-zinc-500">Choose the narrowest view that should contain this asset.</p>
            </div>
            {scopeRule.mode === "locked" && <span className="text-xs uppercase text-zinc-500">Locked by asset type</span>}
          </div>
          <select
            value={draft.portfolioScope}
            onChange={(event) => setDraft((previous) => ({
              ...previous,
              portfolioScope: event.target.value,
              scopeNeedsReview: false,
            }))}
            disabled={scopeRule.mode === "locked"}
            className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 disabled:opacity-60"
          >
            {Object.entries(portfolioScopeOptions).map(([key, option]) => (
              <option key={key} value={key}>{option.name}</option>
            ))}
          </select>
          <p className="text-xs text-zinc-400">{portfolioScopeOptions[draft.portfolioScope]?.description}</p>
          <div className="grid md:grid-cols-3 gap-2 text-xs text-zinc-500">
            <div><span className="text-zinc-300">Total only:</span> home, private company, personal-use assets.</div>
            <div><span className="text-zinc-300">Investable:</span> bank and emergency cash available to move.</div>
            <div><span className="text-zinc-300">Financial:</span> ETFs, stocks, bonds, pension investments.</div>
          </div>
        </div>

        <div className="border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-medium">Valuation</h3>
            <select
              value={draft.valuationMode}
              onChange={(event) => set("valuationMode", event.target.value)}
              className="rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm"
            >
              <option value="total">Direct total value</option>
              <option value="units">Quantity × unit price</option>
            </select>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            {draft.valuationMode === "units" ? (
              <>
                <TextInput label="Quantity" type="number" value={String(draft.quantity)} onChange={(value) => set("quantity", value)} />
                <TextInput label={`Unit price (${draft.pricingCurrency})`} type="number" value={String(draft.unitPrice)} onChange={(value) => set("unitPrice", value)} />
              </>
            ) : (
              <TextInput label={`Current total value (${draft.pricingCurrency})`} type="number" value={String(draft.value)} onChange={(value) => set("value", value)} />
            )}
            <TextInput label={`FX rate to ${currency}`} type="number" value={String(draft.fxRate)} onChange={(value) => set("fxRate", value)} />
            <TextInput label={`Total cost basis (${draft.pricingCurrency})`} type="number" value={String(draft.costBasis)} onChange={(value) => set("costBasis", value)} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 border border-zinc-800 rounded-xl p-4">
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.isCheckingAccount}
              onChange={(event) => set("isCheckingAccount", event.target.checked)}
            />
            Include this cash account in the cash-reserve calculation
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={draft.eligibleForInvestment}
              onChange={(event) => set("eligibleForInvestment", event.target.checked)}
            />
            Eligible for additional investment
          </label>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium">Concentration dimensions</h3>
            <p className="text-xs text-zinc-500">Use one category at 100%, or split a diversified asset across several categories.</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-3">
            {Object.entries(dimensions).filter(([key]) => key !== "ownership").map(([key, definition]) => (
              <div key={key} className="border border-zinc-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium">{definition.name}</h4>
                  {rules[key]?.mode && <span className="text-[11px] uppercase text-zinc-500">{rules[key].mode}</span>}
                </div>
                <DimensionExposureEditor
                  definition={definition}
                  rule={rules[key]}
                  value={draft.dimensions?.[key] || {}}
                  onChange={(exposure) => setDraft((previous) => ({
                    ...previous,
                    dimensions: { ...previous.dimensions, [key]: exposure },
                  }))}
                />
              </div>
            ))}
          </div>
        </div>

        <TextInput label="Valuation notes" value={draft.notes} onChange={(value) => set("notes", value)} />

        <div className="flex justify-between gap-2 pt-2">
          <div>
            {asset && onDelete && (
              <button type="button" onClick={() => onDelete(asset)} title="Delete" className="px-3 py-2 rounded-lg bg-red-700 hover:bg-red-600">🗑️</button>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} title="Close" className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">✖</button>
            <button type="submit" title={asset ? "Save" : "Add"} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">
              {asset ? "💾" : "➕"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
