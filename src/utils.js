export function mkId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
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
    ownership: "personal",
    ownershipShare: 100,
    acquiredOn: "",
    status: "active",
    pricingCurrency: "EUR",
    valuationMode: "total",
    isCheckingAccount: type === "cash",
    eligibleForInvestment: type !== "cash",
    dimensions: {},
    quantity: 0,
    unitPrice: 0,
    fxRate: 1,
    value: 0,
    costBasis: 0,
    valuationDate: "",
    notes: "",
  };
}

export function stripIds(a) {
  const { id, ...rest } = a;
  return rest;
}

export function formatCurrency(n, currency = "EUR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${Math.round(Number(n) || 0).toLocaleString()} ${currency}`;
  }
}
