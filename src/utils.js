export function mkId() {
  return Math.random().toString(36).slice(2);
}

export const pieColors = [
  "#8ab4f8",
  "#f28b82",
  "#fbbc04",
  "#34a853",
  "#ff6d01",
  "#a142f4",
  "#00acc1",
  "#ffab40",
];

export function labelFor(key, registry = {}) {
  return registry[key]?.label || key;
}

export function mkAsset(type, registry, name = "") {
  const def = registry[type] || { fields: [] };
  const out = { id: mkId(), type, name: name || def.label || type, value: 0 };
  for (const k of def.fields || []) out[k] = "";
  return out;
}

export function stripIds(a) {
  const { id, ...rest } = a;
  return rest;
}

export function formatCurrency(n) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${Math.round(n).toLocaleString()} €`;
  }
}
