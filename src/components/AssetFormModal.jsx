import { useEffect, useMemo, useState } from "react";
import { applyAssetTypeRules, assetValue, normalizeAsset, portfolioScopeOptions } from "../data.js";
import { formatCurrency, mkAsset } from "../utils.js";
import CurrencySelect from "./CurrencySelect.jsx";
import DimensionExposureEditor from "./DimensionExposureEditor.jsx";
import Modal from "./Modal.jsx";
import { FxRateInput, MoneyInput, PercentageInput, QuantityInput } from "./NumberInput.jsx";
import TextInput from "./TextInput.jsx";

function initialAsset(asset, assetTypes, currency) {
  if (asset) return normalizeAsset(asset, assetTypes);
  const type = Object.keys(assetTypes)[0] || "cash";
  const base = mkAsset(type, assetTypes);
  base.pricingCurrency = currency;
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

function concentrationSummary(assetDimensions, dimensions, rules) {
  const applicable = Object.entries(dimensions).filter(([key]) => key !== "ownership" && rules[key]?.mode !== "na");
  if (!applicable.length) return "No applicable dimensions";
  let classified = 0;
  let split = 0;
  for (const [key] of applicable) {
    const entries = Object.entries(assetDimensions?.[key] || {}).filter(([, percentage]) => Number(percentage) > 0);
    if (entries.length) classified += 1;
    if (entries.length > 1) split += 1;
  }
  return `${classified}/${applicable.length} classified${split ? ` · ${split} split` : ""}`;
}

export default function AssetFormModal({
  open,
  asset,
  onClose,
  assetTypes,
  assets = [],
  dimensions,
  currency = "EUR",
  referencedCurrencies = [],
  onSave,
  onDelete,
}) {
  const [draft, setDraft] = useState(() => initialAsset(asset, assetTypes, currency));
  const [original, setOriginal] = useState(() => initialAsset(asset, assetTypes, currency));

  useEffect(() => {
    if (!open) return;
    const next = initialAsset(asset, assetTypes, currency);
    setDraft(next);
    setOriginal(next);
  }, [open, asset, assetTypes, currency]);

  const calculatedValue = useMemo(() => assetValue(draft), [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const sameCurrency = draft.pricingCurrency === currency;
  const nameError = draft.name.trim() ? "" : "Asset name is required.";
  const ownershipError = Number(draft.ownershipShare) > 0 && Number(draft.ownershipShare) <= 100 ? "" : "Ownership share must be greater than 0 and no more than 100.";
  const fxError = Number(draft.fxRate) > 0 ? "" : "FX rate must be greater than zero.";
  const valueError = draft.valuationMode === "units"
    ? Number(draft.quantity) < 0 || Number(draft.unitPrice) < 0
    : Number(draft.value) < 0;
  const valid = !nameError && !ownershipError && !fxError && !valueError;

  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }

  function changeType(type) {
    setDraft((previous) => applyAssetTypeRules(normalizeAsset({
      ...previous,
      type,
      isCheckingAccount: type === "cash",
      reserveToKeep: "",
      isInvestmentCashAccount: false,
      eligibleForInvestment: type !== "cash" && type !== "real_estate",
    }, assetTypes), assetTypes, true));
  }

  function changeScope(portfolioScope) {
    setDraft((previous) => ({
      ...previous,
      portfolioScope,
      scopeNeedsReview: false,
      isCheckingAccount: portfolioScope === "financial" ? false : previous.isCheckingAccount,
      reserveToKeep: portfolioScope === "financial" ? "" : previous.reserveToKeep,
      isInvestmentCashAccount: portfolioScope === "financial" ? previous.isInvestmentCashAccount : false,
    }));
  }

  function setCheckingAccount(checked) {
    setDraft((previous) => ({
      ...previous,
      isCheckingAccount: checked,
      portfolioScope: checked ? "investable" : previous.portfolioScope,
      isInvestmentCashAccount: checked ? false : previous.isInvestmentCashAccount,
    }));
  }

  function setInvestmentCashAccount(checked) {
    setDraft((previous) => ({
      ...previous,
      isInvestmentCashAccount: checked,
      portfolioScope: checked ? "financial" : previous.portfolioScope,
      isCheckingAccount: checked ? false : previous.isCheckingAccount,
      reserveToKeep: checked ? "" : previous.reserveToKeep,
      eligibleForInvestment: checked ? false : previous.eligibleForInvestment,
    }));
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
  const applicableDimensions = Object.entries(dimensions).filter(([key]) => key !== "ownership" && rules[key]?.mode !== "na");
  const otherInvestmentCashAccount = assets.find((item) => item.id !== draft.id && item.isInvestmentCashAccount);

  return (
    <Modal
      open={open}
      title={asset ? "Edit asset" : "Add asset"}
      description={`Current portfolio value: ${formatCurrency(calculatedValue, currency)}`}
      onClose={onClose}
      dirty={dirty}
      onSubmit={submit}
      size="max-w-7xl"
      contentClassName="p-3"
      deleteAction={asset && onDelete ? <button type="button" onClick={() => onDelete(asset)} className="rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600">🗑️ Delete asset</button> : null}
      primaryAction={<button type="submit" disabled={!valid} className="rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{asset ? "Save asset" : "Add asset"}</button>}
    >
      <div className="space-y-3">
        {draft.scopeNeedsReview && (
          <div className="rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-200">
            Review this asset’s portfolio scope. It could not be classified safely during the file upgrade; saving confirms your selection.
          </div>
        )}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(32rem,1.05fr)] lg:items-start">
          <div className="space-y-3">
            <section className="space-y-2 rounded-xl border border-zinc-800 p-3">
              <div>
                <h3 className="font-medium">Basics</h3>
                <p className="text-xs text-zinc-500">Identity and ownership.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-zinc-800 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Valuation</h3>
                  <p className="text-xs text-zinc-500">Direct value or units × price.</p>
                </div>
                <select value={draft.valuationMode} onChange={(event) => set("valuationMode", event.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm">
                  <option value="total">Direct total value</option>
                  <option value="units">Quantity × unit price</option>
                </select>
              </div>
              <div className={`grid grid-cols-1 gap-2 sm:grid-cols-2 ${draft.valuationMode === "units" ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
                <CurrencySelect label="Pricing currency" value={draft.pricingCurrency} onChange={changeCurrency} referencedCurrencies={currencies} />
                {draft.valuationMode === "units" ? (
                  <>
                    <QuantityInput label="Quantity" value={draft.quantity} onChange={(value) => set("quantity", value)} />
                    <MoneyInput label={`Unit price (${draft.pricingCurrency})`} currency={draft.pricingCurrency} value={draft.unitPrice} onChange={(value) => set("unitPrice", value)} />
                  </>
                ) : (
                  <MoneyInput label={`Current value (${draft.pricingCurrency})`} currency={draft.pricingCurrency} value={draft.value} onChange={(value) => set("value", value)} />
                )}
                <FxRateInput
                  label={`FX rate to ${currency}`}
                  value={draft.fxRate}
                  onChange={(value) => set("fxRate", value)}
                  disabled={sameCurrency}
                  externalError={fxError}
                  warning={!sameCurrency && Number(draft.fxRate) === 1 ? "Confirm that 1 is the intended FX rate." : ""}
                />
              </div>
            </section>

            <section className="space-y-2 rounded-xl border border-zinc-800 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-medium">Portfolio classification</h3>
                  <p className="text-xs text-zinc-500">Scope and recommendation role.</p>
                </div>
                <span className="text-xs text-zinc-500">{portfolioScopeOptions[draft.portfolioScope]?.name}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 sm:items-start">
                <label className="block text-sm">
                  <span className="flex items-center justify-between gap-2 text-zinc-400">
                    Portfolio scope
                    {scopeRule.mode === "locked" && <span className="text-xs text-zinc-500">Fixed by type</span>}
                  </span>
                  <select value={draft.portfolioScope} onChange={(event) => changeScope(event.target.value)} disabled={scopeRule.mode === "locked"} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 disabled:opacity-60">
                    {Object.entries(portfolioScopeOptions).map(([key, option]) => <option key={key} value={key}>{option.name}</option>)}
                  </select>
                  <span className="mt-1 block text-xs text-zinc-500">{portfolioScopeOptions[draft.portfolioScope]?.description}</span>
                </label>
                {draft.type === "cash" ? (
                  <div className="space-y-2">
                    <label className="flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm">
                      <input type="checkbox" className="mt-0.5" checked={draft.isCheckingAccount} onChange={(event) => setCheckingAccount(event.target.checked)} />
                      <span><span className="block">Cash-reserve checking account</span><span className="block text-xs text-zinc-500">Guidance keeps this account funded before investing.</span></span>
                    </label>
                    {draft.isCheckingAccount && (
                      <MoneyInput
                        label={`Reserve to keep (${currency})`}
                        value={draft.reserveToKeep}
                        onChange={(value) => set("reserveToKeep", value)}
                        currency={currency}
                        required={false}
                        placeholder="Equal share of remaining reserve"
                      />
                    )}
                    <label className="flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm">
                      <input type="checkbox" className="mt-0.5" checked={draft.isInvestmentCashAccount} onChange={(event) => setInvestmentCashAccount(event.target.checked)} />
                      <span>
                        <span className="block">Investment cash destination</span>
                        <span className="block text-xs text-zinc-500">Receives checking-account surplus and funds the next investment.</span>
                        {draft.isInvestmentCashAccount && otherInvestmentCashAccount && <span className="mt-1 block text-xs text-amber-400">Saving replaces {otherInvestmentCashAccount.name} as the destination.</span>}
                      </span>
                    </label>
                  </div>
                ) : (
                  <label className="flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm">
                    <input type="checkbox" className="mt-0.5" checked={draft.eligibleForInvestment} onChange={(event) => set("eligibleForInvestment", event.target.checked)} />
                    <span><span className="block">Eligible for investment</span><span className="block text-xs text-zinc-500">Guidance may allocate new money here.</span></span>
                  </label>
                )}
              </div>
            </section>
          </div>

          <section className="space-y-2 rounded-xl border border-zinc-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">Concentration details</h3>
                <p className="text-xs text-zinc-500">Choose one category at 100%; split only diversified assets.</p>
              </div>
              <span className="shrink-0 rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-400">{concentrationSummary(draft.dimensions, dimensions, rules)}</span>
            </div>
            <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 px-3">
              {applicableDimensions.map(([key, definition]) => {
                const rule = rules[key];
                return (
                  <div key={key} className="grid gap-2 py-2 sm:grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] sm:items-center sm:gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-zinc-200">{definition.name}</div>
                      <div className="truncate text-xs text-zinc-500">{ruleLabel(rule?.mode)}</div>
                    </div>
                    <DimensionExposureEditor definition={definition} rule={rule} value={draft.dimensions?.[key] || {}} onChange={(exposure) => setDraft((previous) => ({ ...previous, dimensions: { ...previous.dimensions, [key]: exposure } }))} />
                  </div>
                );
              })}
              {!applicableDimensions.length && <div className="py-4 text-sm text-zinc-500">No concentration dimensions apply to this asset type.</div>}
            </div>
          </section>
        </div>
      </div>
    </Modal>
  );
}
