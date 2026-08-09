export function mkId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const standardCategoryColors = {
  cash: "#34a853",
  real_estate: "#f28b82",
  stock: "#8ab4f8",
  private_equity: "#a142f4",
  bond: "#fbbc04",
  commodity: "#ff6d01",
};

export function colorForCategory(key) {
  const normalizedKey = String(key || "");
  if (standardCategoryColors[normalizedKey]) return standardCategoryColors[normalizedKey];

  let hash = 2166136261;
  for (let index = 0; index < normalizedKey.length; index++) {
    hash ^= normalizedKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `hsl(${(hash >>> 0) % 360} 68% 58%)`;
}

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
    pricingCurrency: "EUR",
    valuationMode: "total",
    isCheckingAccount: type === "cash",
    reserveToKeep: "",
    isInvestmentCashAccount: false,
    eligibleForInvestment: type !== "cash",
    dimensions: {},
    quantity: 0,
    unitPrice: 0,
    fxRate: 1,
    value: 0,
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
