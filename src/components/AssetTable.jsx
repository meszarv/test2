import { useMemo, useState } from "react";
import { assetValue, costBasisValue } from "../data.js";
import { formatCurrency } from "../utils.js";
import NumberInput from "./NumberInput.jsx";
import UndoToast from "./UndoToast.jsx";

function InlineNumber({ label, value, formatted, onCommit, readOnly, kind = "money", currency, precision, width = "w-32" }) {
  if (readOnly) return <span className="block px-1 py-1 text-right">{formatted}</span>;
  return (
    <NumberInput
      label={label}
      value={value}
      onChange={onCommit}
      kind={kind}
      currency={currency}
      precision={precision}
      min={0}
      className={`${width} [&>span:first-child]:sr-only`}
      inputClassName="border-transparent bg-transparent px-1 py-1 text-right hover:border-zinc-700 focus:bg-zinc-800"
    />
  );
}

export default function AssetTable({ assets, prevAssets, setAssets, assetTypes, currency = "EUR", readOnly = false, onEdit }) {
  const [sort, setSort] = useState({ key: "name", asc: true });
  const [undo, setUndo] = useState(null);
  const previousValues = useMemo(() => new Map((prevAssets || []).map((asset) => [asset.id, assetValue(asset)])), [prevAssets]);

  function update(id, key, value) {
    if (readOnly) return;
    const previous = assets.find((asset) => asset.id === id);
    if (!previous || Number(previous[key]) === Number(value)) return;
    setUndo({ asset: previous, message: `${previous.name}: ${key === "costBasis" ? "cost basis" : key === "unitPrice" ? "unit price" : key} updated.` });
    setAssets(assets.map((asset) => asset.id === id ? { ...asset, [key]: value } : asset));
  }

  const sortedAssets = useMemo(() => {
    const list = [...(assets || [])];
    list.sort((left, right) => {
      const values = {
        name: [(left.name || "").toLowerCase(), (right.name || "").toLowerCase()],
        type: [assetTypes[left.type]?.name || left.type, assetTypes[right.type]?.name || right.type],
        quantity: [Number(left.quantity) || 0, Number(right.quantity) || 0],
        price: [left.valuationMode === "units" ? Number(left.unitPrice) || 0 : Number(left.value) || 0, right.valuationMode === "units" ? Number(right.unitPrice) || 0 : Number(right.value) || 0],
        value: [assetValue(left), assetValue(right)],
        costBasis: [costBasisValue(left), costBasisValue(right)],
        gain: [assetValue(left) - costBasisValue(left), assetValue(right) - costBasisValue(right)],
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
      <table className="w-full min-w-[1040px] text-sm">
        <thead className="text-zinc-400"><tr>{heading("Name", "name")}{heading("Type", "type")}{heading("Quantity", "quantity", "right")}{heading("Price / total", "price", "right")}{heading("Current value", "value", "right")}{heading("Cost basis", "costBasis", "right")}{heading("Gain / loss", "gain", "right")}<th className="w-20 p-2 text-right">Edit</th></tr></thead>
        <tbody>{sortedAssets.map((asset) => {
          const current = assetValue(asset);
          const hasPrevious = previousValues.has(asset.id);
          const previous = previousValues.get(asset.id) ?? 0;
          const delta = hasPrevious ? current - previous : null;
          const basis = costBasisValue(asset);
          const gain = current - basis;
          const quoteCurrency = asset.pricingCurrency || currency;
          return (
            <tr key={asset.id} className={`border-t border-zinc-800 ${asset.status !== "active" ? "opacity-50" : ""}`} onDoubleClick={() => !readOnly && onEdit?.(asset)} title={readOnly ? "Historical snapshot" : "Double-click to edit"}>
              <td className="p-2"><div>{asset.name}</div><div className="text-xs text-zinc-500">{asset.description || asset.status}</div>{asset.scopeNeedsReview && <div className="text-xs text-amber-400">⚠ Review portfolio scope</div>}</td>
              <td className="p-2">{assetTypes[asset.type]?.name || asset.type}</td>
              <td className="p-2 text-right">{asset.valuationMode === "units" ? <InlineNumber label={`${asset.name} quantity`} value={asset.quantity} formatted={(Number(asset.quantity) || 0).toLocaleString(undefined, { maximumFractionDigits: 6 })} kind="quantity" precision={6} onCommit={(value) => update(asset.id, "quantity", value)} readOnly={readOnly} /> : <span className="text-zinc-600">—</span>}</td>
              <td className="p-2 text-right"><InlineNumber label={`${asset.name} ${asset.valuationMode === "units" ? "unit price" : "total value"}`} value={asset.valuationMode === "units" ? asset.unitPrice : asset.value} formatted={formatCurrency(asset.valuationMode === "units" ? asset.unitPrice : asset.value, quoteCurrency)} currency={quoteCurrency} onCommit={(value) => update(asset.id, asset.valuationMode === "units" ? "unitPrice" : "value", value)} readOnly={readOnly} /></td>
              <td className="whitespace-nowrap p-2 text-right"><div>{formatCurrency(current, currency)}</div>{delta == null ? <div className="text-xs text-zinc-500" title="No matching asset in the previous snapshot">—</div> : delta !== 0 && <div className={`text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>{delta >= 0 ? "+" : ""}{formatCurrency(delta, currency)}</div>}</td>
              <td className="p-2 text-right"><InlineNumber label={`${asset.name} cost basis`} value={asset.costBasis} formatted={formatCurrency(asset.costBasis, quoteCurrency)} currency={quoteCurrency} onCommit={(value) => update(asset.id, "costBasis", value)} readOnly={readOnly} /></td>
              <td className={`whitespace-nowrap p-2 text-right ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>{basis > 0 ? formatCurrency(gain, currency) : "—"}</td>
              <td className="p-2 text-right">{readOnly ? "—" : <button type="button" onClick={() => onEdit?.(asset)} className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700">Edit</button>}</td>
            </tr>
          );
        })}</tbody>
      </table>
      {!assets?.length && <div className="py-6 text-center text-sm text-zinc-500">No assets in this snapshot.</div>}
      <UndoToast message={undo?.message || ""} onUndo={() => { if (!undo) return; setAssets(assets.map((asset) => asset.id === undo.asset.id ? undo.asset : asset)); setUndo(null); }} onDismiss={() => setUndo(null)} />
    </div>
  );
}
