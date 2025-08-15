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
  return registry[key]?.name || key;
}

export function mkAsset(type, registry, name = "") {
  const def = registry[type] || {};
  return {
    id: mkId(),
    type,
    name: name || def.name || type,
    description: "",
    value: 0,
  };
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
