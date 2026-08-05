import { useEffect, useMemo, useState } from "react";
import { applyAssetTypeRules, assetValue, normalizeAsset, portfolioScopeOptions } from "../data.js";
import { formatCurrency, mkAsset } from "../utils.js";
import CurrencySelect from "./CurrencySelect.jsx";
import DimensionExposureEditor from "./DimensionExposureEditor.jsx";
import Modal from "./Modal.jsx";
import { FxRateInput, MoneyInput, PercentageInput, QuantityInput } from "./NumberInput.jsx";
import { CollapsiblePanel } from "./SettingsUI.jsx";
import TextInput from "./TextInput.jsx";

function initialAsset(asset, assetTypes, currency) {
  if (asset) return normalizeAsset(asset, assetTypes);
  const type = Object.keys(assetTypes)[0] || "cash";
  const base = mkAsset(type, assetTypes);
  base.pricingCurrency = currency;
  base.valuationDate = new Date().toISOString().slice(0, 10);
  const next = applyAssetTypeRules(normalizeAsset(base, assetTypes), assetTypes, true);
  next.name = "";
  return next;
}

function ruleLabel(mode) {
  return {
    locked: "Fixed by asset type",
    default: "Asset-type default",
    user: "Choose for this asset",
    na: "Not used for this asset type",
  }[mode] || "Choose for this asset";
}

function exposureSummary(exposure, definition, rule) {
  if (rule?.mode === "na") return "Not used for this asset type";
  const entries = Object.entries(exposure || {}).filter(([, percentage]) => Number(percentage) > 0);
  if (!entries.length) return "Unclassified";
  return entries.map(([key, percentage]) => `${definition.values?.[key]?.name || key} ${percentage}%`).join(" · ");
}

export default function AssetFormModal({
  open,
  asset,
  onClose,
  assetTypes,
  dimensions,
  currency = "EUR",
  referencedCurrencies = [],
  onSave,
  onDelete,
}) {
  const [draft, setDraft] = useState(() => initialAsset(asset, assetTypes, currency));
  const [original, setOriginal] = useState(() => initialAsset(asset, assetTypes, currency));
  const [classificationOpen, setClassificationOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [openDimension, setOpenDimension] = useState("");

  useEffect(() => {
    if (!open) return;
    const next = initialAsset(asset, assetTypes, currency);
    setDraft(next);
    setOriginal(next);
    setClassificationOpen(true);
    setAdvancedOpen(false);
    setOpenDimension("");
  }, [open, asset, assetTypes, currency]);

  const calculatedValue = useMemo(() => assetValue(draft), [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const sameCurrency = draft.pricingCurrency === currency;
  const nameError = draft.name.trim() ? "" : "Asset name is required.";
  const ownershipError = Number(draft.ownershipShare) > 0 && Number(draft.ownershipShare) <= 100 ? "" : "Ownership share must be greater than 0 and no more than 100.";
  const dateError = draft.acquiredOn && draft.valuationDate && draft.acquiredOn > draft.valuationDate
    ? "Valuation date cannot be earlier than the acquisition date."
    : "";
  const fxError = Number(draft.fxRate) > 0 ? "" : "FX rate must be greater than zero.";
  const valueError = draft.valuationMode === "units"
    ? Number(draft.quantity) < 0 || Number(draft.unitPrice) < 0
    : Number(draft.value) < 0;
  const valid = !nameError && !ownershipError && !dateError && !fxError && !valueError && Number(draft.costBasis) >= 0;

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

  function changeCurrency(pricingCurrency) {
    setDraft((previous) => ({
      ...previous,
      pricingCurrency,
      fxRate: pricingCurrency === currency ? 1 : previous.fxRate,
    }));
  }

  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    const normalized = { ...normalizeAsset(draft, assetTypes), scopeNeedsReview: false };
    onSave(normalized);
    onClose();
  }

  if (!open) return null;
  const rules = assetTypes[draft.type]?.dimensionRules || {};
  const scopeRule = assetTypes[draft.type]?.scopeRule || { mode: "user", value: "" };
  const currencies = Array.from(new Set([currency, ...referencedCurrencies, draft.pricingCurrency].filter(Boolean)));

  return (
    <Modal
      open={open}
      title={asset ? "Edit asset" : "Add asset"}
      description={`Current portfolio value: ${formatCurrency(calculatedValue, currency)}`}
      onClose={onClose}
      dirty={dirty}
      onSubmit={submit}
      size="max-w-5xl"
      deleteAction={asset && onDelete ? <button type="button" onClick={() => onDelete(asset)} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">🗑️ Delete asset</button> : null}
      primaryAction={<button type="submit" disabled={!valid} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{asset ? "Save asset" : "Add asset"}</button>}
    >
      <div className="space-y-5">
        {draft.scopeNeedsReview && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-200">
            Review this asset’s portfolio scope. It could not be classified safely during the file upgrade; saving confirms your selection.
          </div>
        )}

        <section className="space-y-3 rounded-xl border border-zinc-800 p-4">
          <div>
            <h3 className="font-medium">Basics</h3>
            <p className="text-xs text-zinc-500">Identify the asset and record how it is owned.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <TextInput autoFocus required label="Asset name" placeholder={assetTypes[draft.type]?.name || "Asset name"} value={draft.name} onChange={(value) => set("name", value)} error={nameError} />
            <label className="block text-sm">
              <span className="text-zinc-400">Asset type</span>
              <select value={draft.type} onChange={(event) => changeType(event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100">
                {Object.entries(assetTypes).map(([key, definition]) => <option key={key} value={key}>{definition.name}</option>)}
              </select>
            </label>
            <TextInput label="Description" value={draft.description} onChange={(value) => set("description", value)} />
            <label className="block text-sm">
              <span className="text-zinc-400">Ownership</span>
              <select value={draft.ownership} onChange={(event) => set("ownership", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100">
                {Object.entries(dimensions.ownership?.values || {}).map(([key, definition]) => <option key={key} value={key}>{definition.name}</option>)}
              </select>
            </label>
            <PercentageInput label="Ownership share %" min={0.01} value={draft.ownershipShare} onChange={(value) => set("ownershipShare", value)} externalError={ownershipError} />
            <TextInput label="First acquisition date" type="date" value={draft.acquiredOn} onChange={(value) => set("acquiredOn", value)} error={dateError} />
            <label className="block text-sm">
              <span className="text-zinc-400">Status</span>
              <select value={draft.status} onChange={(event) => set("status", event.target.value)} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100">
                <option value="active">Active</option>
                <option value="sold">Sold</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <TextInput label="Valuation date" type="date" value={draft.valuationDate} onChange={(value) => set("valuationDate", value)} error={dateError} />
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Valuation</h3>
              <p className="text-xs text-zinc-500">Choose whether to enter a direct value or calculate value from units.</p>
            </div>
            <select value={draft.valuationMode} onChange={(event) => set("valuationMode", event.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm">
              <option value="total">Direct total value</option>
              <option value="units">Quantity × unit price</option>
            </select>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <CurrencySelect label="Pricing currency" value={draft.pricingCurrency} onChange={changeCurrency} referencedCurrencies={currencies} />
            {draft.valuationMode === "units" ? (
              <>
                <QuantityInput label="Quantity" value={draft.quantity} onChange={(value) => set("quantity", value)} />
                <MoneyInput label={`Unit price (${draft.pricingCurrency})`} currency={draft.pricingCurrency} value={draft.unitPrice} onChange={(value) => set("unitPrice", value)} />
              </>
            ) : (
              <MoneyInput label={`Current total value (${draft.pricingCurrency})`} currency={draft.pricingCurrency} value={draft.value} onChange={(value) => set("value", value)} />
            )}
            <FxRateInput
              label={`FX rate to ${currency}`}
              value={draft.fxRate}
              onChange={(value) => set("fxRate", value)}
              disabled={sameCurrency}
              externalError={fxError}
              warning={!sameCurrency && Number(draft.fxRate) === 1 ? "Confirm that 1 is the intended FX rate." : sameCurrency ? "Same-currency assets always use an FX rate of 1." : ""}
            />
            <MoneyInput label={`Total cost basis (${draft.pricingCurrency})`} currency={draft.pricingCurrency} value={draft.costBasis} onChange={(value) => set("costBasis", value)} />
          </div>
          <p className="text-xs text-zinc-500">Values from the inactive valuation method are retained, but only the selected method is used in calculations.</p>
        </section>

        <CollapsiblePanel title="Portfolio classification" summary={portfolioScopeOptions[draft.portfolioScope]?.name || "Choose portfolio scope"} open={classificationOpen} onToggle={() => setClassificationOpen((value) => !value)}>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-medium">Portfolio scope</h3>
                  <p className="text-xs text-zinc-500">Choose the narrowest view that should contain this asset.</p>
                </div>
                {scopeRule.mode === "locked" && <span className="text-xs text-zinc-500">Fixed by asset type</span>}
              </div>
              <select value={draft.portfolioScope} onChange={(event) => setDraft((previous) => ({ ...previous, portfolioScope: event.target.value, scopeNeedsReview: false }))} disabled={scopeRule.mode === "locked"} className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 disabled:opacity-60">
                {Object.entries(portfolioScopeOptions).map(([key, option]) => <option key={key} value={key}>{option.name}</option>)}
              </select>
              <p className="mt-2 text-xs text-zinc-400">{portfolioScopeOptions[draft.portfolioScope]?.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 p-4">
              {draft.type === "cash" && (
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-0.5" checked={draft.isCheckingAccount} onChange={(event) => set("isCheckingAccount", event.target.checked)} />
                  <span><span className="block">Include in cash-reserve calculation</span><span className="mt-1 block text-xs text-zinc-500">Cash above the configured reserve can be recommended for investment.</span></span>
                </label>
              )}
              {draft.type !== "cash" && (
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" className="mt-0.5" checked={draft.eligibleForInvestment} onChange={(event) => set("eligibleForInvestment", event.target.checked)} />
                  <span><span className="block">Eligible for additional investment</span><span className="mt-1 block text-xs text-zinc-500">Surplus-cash recommendations may allocate new money to this asset.</span></span>
                </label>
              )}
            </div>
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel title="Advanced details" summary="Concentration dimensions and valuation notes" open={advancedOpen} onToggle={() => setAdvancedOpen((value) => !value)}>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Concentration dimensions</h3>
              <p className="text-xs text-zinc-500">Use one category at 100%, or split a diversified asset across several categories.</p>
            </div>
            {Object.entries(dimensions).filter(([key]) => key !== "ownership").map(([key, definition]) => {
              const rule = rules[key];
              return (
                <CollapsiblePanel
                  key={key}
                  title={definition.name}
                  summary={`${ruleLabel(rule?.mode)} · ${exposureSummary(draft.dimensions?.[key], definition, rule)}`}
                  open={openDimension === key}
                  onToggle={() => setOpenDimension((current) => current === key ? "" : key)}
                >
                  <DimensionExposureEditor definition={definition} rule={rule} value={draft.dimensions?.[key] || {}} onChange={(exposure) => setDraft((previous) => ({ ...previous, dimensions: { ...previous.dimensions, [key]: exposure } }))} />
                </CollapsiblePanel>
              );
            })}
            <TextInput label="Valuation notes" value={draft.notes} onChange={(value) => set("notes", value)} />
          </div>
        </CollapsiblePanel>
      </div>
    </Modal>
  );
}
