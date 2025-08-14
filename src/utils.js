export function mkId() {
  return Math.random().toString(36).slice(2);
}

export function labelFor(key, types) {
  return types[key]?.label || key;
}

export function mkAsset(type, registry) {
  const def = registry[type] || { fields: [] };
  const out = { id: mkId(), type, value: 0 };
  for (const f of def.fields) out[f.key] = f.default || "";
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
