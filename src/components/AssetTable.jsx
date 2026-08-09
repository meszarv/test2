import { useMemo, useState } from "react";
import { assetValue } from "../data.js";
import { formatCurrency } from "../utils.js";
import NumberInput from "./NumberInput.jsx";
import UndoToast from "./UndoToast.jsx";

function portfolioRole(asset) {
  if (asset.isInvestmentCashAccount) return "Investment cash destination";
  if (asset.isCheckingAccount && asset.portfolioScope !== "total") return "Reserve cash";
  if (asset.portfolioScope === "financial" && asset.eligibleForInvestment) return "Investment destination";
  if (asset.portfolioScope === "financial") return "Managed investment";
  if (asset.portfolioScope === "investable") return "Accessible capital";
  return "Net-worth asset";
}

function currentValueFactor(asset) {
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const ownership = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  const quantity = asset.valuationMode === "units" ? Number(asset.quantity) || 0 : 1;
  return fx * ownership * quantity;
}

export function withAssetCurrentValue(asset, currentValue) {
  const factor = currentValueFactor(asset);
  if (factor <= 0) return asset;
  const rawValue = (Number(currentValue) || 0) / factor;
  return asset.valuationMode === "units"
    ? { ...asset, unitPrice: rawValue }
    : { ...asset, value: rawValue };
}

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, currency = "EUR", readOnly = false, onEdit }) {
  const [sort, setSort] = useState({ key: "name", asc: true });
  const [undo, setUndo] = useState(null);
  const previousValues = useMemo(() => new Map((prevAssets || []).map((asset) => [asset.id, assetValue(asset)])), [prevAssets]);

  function updateCurrentValue(id, value) {
    if (readOnly) return;
    const previous = assets.find((asset) => asset.id === id);
    if (!previous) return;
    const updated = withAssetCurrentValue(previous, value);
    if (updated === previous || assetValue(updated) === assetValue(previous)) return;
    setUndo({ asset: previous, message: `${previous.name}: current value updated.` });
    setAssets?.(assets.map((asset) => asset.id === id ? updated : asset));
  }

  const sortedAssets = useMemo(() => {
    const list = [...(assets || [])];
    list.sort((left, right) => {
      const values = {
        name: [(left.name || "").toLowerCase(), (right.name || "").toLowerCase()],
        type: [assetTypes[left.type]?.name || left.type, assetTypes[right.type]?.name || right.type],
        value: [assetValue(left), assetValue(right)],
        role: [portfolioRole(left), portfolioRole(right)],
      }[sort.key] || [left[sort.key] || "", right[sort.key] || ""];
      const comparison = typeof values[0] === "string" ? values[0].localeCompare(values[1]) : values[0] - values[1];
      return sort.asc ? comparison : -comparison;
    });
    return list;
  }, [assets, assetTypes, sort]);

  function heading(label, key, align = "left") {
    return <th className={`${align === "right" ? "text-right" : "text-left"} cursor-pointer whitespace-nowrap p-2`} onClick={() => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true })}>{label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}</th>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-sm">
        <thead className="text-zinc-400"><tr>{heading("Name", "name")}{heading("Type", "type")}{heading("Current value", "value", "right")}{heading("Portfolio role", "role")}<th className="w-20 p-2 text-right">Edit</th></tr></thead>
        <tbody>{sortedAssets.map((asset) => {
          const current = assetValue(asset);
          const hasPrevious = previousValues.has(asset.id);
          const previous = previousValues.get(asset.id) ?? 0;
          const delta = hasPrevious ? current - previous : null;
          const canQuickEdit = currentValueFactor(asset) > 0;
          return (
            <tr key={asset.id} className="border-t border-zinc-800" onDoubleClick={() => !readOnly && onEdit?.(asset)} title={readOnly ? "Historical snapshot" : "Double-click to edit"}>
              <td className="p-2"><div>{asset.name}</div>{asset.description && <div className="text-xs text-zinc-500">{asset.description}</div>}{asset.scopeNeedsReview && <div className="text-xs text-amber-400">⚠ Review portfolio scope</div>}</td>
              <td className="p-2">{assetTypes[asset.type]?.name || asset.type}</td>
              <td className="whitespace-nowrap p-2 text-right" onDoubleClick={(event) => event.stopPropagation()} title={!readOnly && asset.valuationMode === "units" ? "Editing the current value recalculates the unit price." : undefined}>
                {readOnly || !canQuickEdit
                  ? <div>{formatCurrency(current, currency)}</div>
                  : <NumberInput label={`${asset.name} current value`} kind="money" currency={currency} min={0} precision={2} value={current} onChange={(value) => updateCurrentValue(asset.id, value)} className="ml-auto w-36 [&>span:first-child]:sr-only" inputClassName="border-transparent bg-transparent px-1 py-1 text-right hover:border-zinc-700 focus:bg-zinc-800" />}
                {delta == null ? <div className="text-xs text-zinc-500" title="No matching asset in the previous snapshot">—</div> : delta !== 0 && <div className={`text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{delta >= 0 ? "+" : ""}{formatCurrency(delta, currency)}</div>}
              </td>
              <td className="p-2 text-zinc-300">{portfolioRole(asset)}</td>
              <td className="p-2 text-right">{readOnly ? "—" : <button type="button" onClick={() => onEdit?.(asset)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700">Edit</button>}</td>
            </tr>
          );
        })}</tbody>
      </table>
      {!assets?.length && <div className="py-6 text-center text-sm text-zinc-500">No assets in this snapshot.</div>}
      <UndoToast message={undo?.message || ""} onUndo={() => { if (!undo) return; setAssets?.(assets.map((asset) => asset.id === undo.asset.id ? undo.asset : asset)); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </div>
  );
}
