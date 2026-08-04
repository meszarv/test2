import React, { useMemo, useState } from "react";
import { assetValue, costBasisValue } from "../data.js";
import { formatCurrency } from "../utils.js";

function InlineNumber({ value, formatted, onChange, readOnly, width = "w-28" }) {
  return (
    <div className={`relative ${width}`}>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => event.target.select()}
        className="peer bg-transparent border border-transparent text-right px-1 py-1 rounded focus:bg-zinc-800 focus:border-blue-500 focus:outline-none w-full text-transparent focus:text-inherit read-only:cursor-default"
        readOnly={readOnly}
      />
      <span className={`pointer-events-none absolute inset-0 flex items-center justify-end px-1 ${readOnly ? "" : "peer-focus:hidden"}`}>
        {formatted}
      </span>
    </div>
  );
}

export default function AssetTable({
  assets,
  prevAssets,
  setAssets,
  assetTypes,
  currency = "EUR",
  readOnly = false,
  onEdit,
}) {
  const [sort, setSort] = useState({ key: "name", asc: true });
  const previousValues = useMemo(
    () => new Map((prevAssets || []).map((asset) => [asset.id, assetValue(asset)])),
    [prevAssets]
  );

  function update(id, key, value) {
    if (readOnly) return;
    setAssets(assets.map((asset) => asset.id === id ? { ...asset, [key]: Number(value) || 0 } : asset));
  }

  const sortedAssets = useMemo(() => {
    const list = [...(assets || [])];
    list.sort((left, right) => {
      const values = {
        name: [(left.name || "").toLowerCase(), (right.name || "").toLowerCase()],
        type: [assetTypes[left.type]?.name || left.type, assetTypes[right.type]?.name || right.type],
        quantity: [Number(left.quantity) || 0, Number(right.quantity) || 0],
        value: [assetValue(left), assetValue(right)],
        costBasis: [costBasisValue(left), costBasisValue(right)],
        gain: [assetValue(left) - costBasisValue(left), assetValue(right) - costBasisValue(right)],
      }[sort.key] || [left[sort.key] || "", right[sort.key] || ""];
      const comparison = typeof values[0] === "string"
        ? values[0].localeCompare(values[1])
        : values[0] - values[1];
      return sort.asc ? comparison : -comparison;
    });
    return list;
  }, [assets, assetTypes, sort]);

  function handleSort(key) {
    setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true });
  }

  function heading(label, key, align = "left") {
    return (
      <th className={`${align === "right" ? "text-right" : "text-left"} p-2 cursor-pointer whitespace-nowrap`} onClick={() => handleSort(key)}>
        {label} {sort.key === key ? (sort.asc ? "▲" : "▼") : ""}
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[940px]">
        <thead className="text-zinc-400">
          <tr>
            {heading("Name", "name")}
            {heading("Type", "type")}
            {heading("Quantity", "quantity", "right")}
            {heading("Price / total", "price", "right")}
            {heading("Current value", "value", "right")}
            {heading("Cost basis", "costBasis", "right")}
            {heading("Gain / loss", "gain", "right")}
          </tr>
        </thead>
        <tbody>
          {sortedAssets.map((asset) => {
            const current = assetValue(asset);
            const previous = previousValues.get(asset.id) || 0;
            const delta = current - previous;
            const basis = costBasisValue(asset);
            const gain = current - basis;
            const quoteCurrency = asset.pricingCurrency || currency;
            return (
              <tr
                key={asset.id}
                className={`border-t border-zinc-800 ${asset.status !== "active" ? "opacity-50" : ""}`}
                onDoubleClick={() => !readOnly && onEdit?.(asset)}
                title={readOnly ? "Historical snapshot" : "Double-click to edit"}
              >
                <td className="p-2">
                  <div>{asset.name}</div>
                  <div className="text-xs text-zinc-500">{asset.description || asset.status}</div>
                  {asset.scopeNeedsReview && <div className="text-xs text-amber-400">⚠ Review portfolio scope</div>}
                </td>
                <td className="p-2">{assetTypes[asset.type]?.name || asset.type}</td>
                <td className="p-2 text-right">
                  {asset.valuationMode === "units" ? (
                    <InlineNumber
                      value={asset.quantity}
                      formatted={(Number(asset.quantity) || 0).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      onChange={(value) => update(asset.id, "quantity", value)}
                      readOnly={readOnly}
                    />
                  ) : <span className="text-zinc-600">—</span>}
                </td>
                <td className="p-2 text-right">
                  <InlineNumber
                    value={asset.valuationMode === "units" ? asset.unitPrice : asset.value}
                    formatted={formatCurrency(asset.valuationMode === "units" ? asset.unitPrice : asset.value, quoteCurrency)}
                    onChange={(value) => update(asset.id, asset.valuationMode === "units" ? "unitPrice" : "value", value)}
                    readOnly={readOnly}
                  />
                </td>
                <td className="p-2 text-right whitespace-nowrap">
                  <div>{formatCurrency(current, currency)}</div>
                  {delta !== 0 && (
                    <div className={`text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {delta >= 0 ? "+" : ""}{formatCurrency(delta, currency)}
                    </div>
                  )}
                </td>
                <td className="p-2 text-right">
                  <InlineNumber
                    value={asset.costBasis}
                    formatted={formatCurrency(asset.costBasis, quoteCurrency)}
                    onChange={(value) => update(asset.id, "costBasis", value)}
                    readOnly={readOnly}
                  />
                </td>
                <td className={`p-2 text-right whitespace-nowrap ${gain >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {basis > 0 ? formatCurrency(gain, currency) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!assets?.length && <div className="py-6 text-center text-sm text-zinc-500">No assets in this snapshot.</div>}
    </div>
  );
}
