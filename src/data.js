export const defaultAssetTypes = {
  cash: { name: "Cash" },
  real_estate: { name: "Real estate" },
  stock: { name: "Stock" },
  private_equity: { name: "Private equity" },
  bond: { name: "Bond" },
  commodity: { name: "Commodity" },
};

export const defaultLiabilityTypes = {
  credit_card: { name: "Credit card" },
  loan: { name: "Loan" },
  mortgage: { name: "Mortgage" },
};

export function netWorth(assets, liabilities) {
  const assetTotal = (assets || []).reduce((acc, a) => acc + (Number(a.value) || 0), 0);
  const liabilityTotal = (liabilities || []).reduce((acc, l) => acc + (Number(l.value) || 0), 0);
  return assetTotal - liabilityTotal;
}

// Returns net amounts by asset category with liabilities spread proportionally.
export function currentByCategory(assets, liabilities) {
  const assetMap = {};
  for (const a of assets || []) {
    const key = a.type;
    assetMap[key] = (assetMap[key] || 0) + (Number(a.value) || 0);
  }
  const assetTotal = Object.values(assetMap).reduce((a, b) => a + b, 0);
  const liabilityTotal = (liabilities || []).reduce(
    (a, l) => a + (Number(l.value) || 0),
    0
  );
  if (assetTotal === 0) return {};
  const ratio = liabilityTotal / assetTotal;
  const map = {};
  for (const [k, v] of Object.entries(assetMap)) {
    map[k] = v - v * ratio;
  }
  return map;
}

export function normalizeAllocation(alloc) {
  const total = Object.values(alloc).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const out = {};
  for (const k of Object.keys(alloc)) out[k] = (Number(alloc[k]) || 0) / total;
  return out; // fractions summing to ~1
}

export function rebalance(assets, liabilities, allocPct) {
  const adjAssets = (assets || []).map((a) => ({ ...a }));
  const adjLiabilities = (liabilities || []).map((l) => ({ ...l }));

  let cashAvailable = adjAssets
    .filter((a) => a.type === "cash")
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  for (const l of adjLiabilities) {
    if (!l.priority) continue;
    const payoff = Math.min(cashAvailable, Number(l.value) || 0);
    l.value = (Number(l.value) || 0) - payoff;
    cashAvailable -= payoff;
  }

  let toDeduct = adjAssets
    .filter((a) => a.type === "cash")
    .reduce((sum, a) => sum + (Number(a.value) || 0), 0) - cashAvailable;
  for (const a of adjAssets) {
    if (a.type !== "cash" || toDeduct <= 0) continue;
    const avail = Number(a.value) || 0;
    const used = Math.min(avail, toDeduct);
    a.value = avail - used;
    toDeduct -= used;
  }

  const totalNow = netWorth(adjAssets, adjLiabilities);
  const byCat = currentByCategory(adjAssets, adjLiabilities);
  let norm = normalizeAllocation(allocPct);
  if (Object.keys(norm).length === 0) {
    const cats = Object.keys(byCat);
    const share = 1 / (cats.length || 1);
    norm = Object.fromEntries(cats.map((c) => [c, share]));
  }
  const cats = Array.from(new Set([...Object.keys(byCat), ...Object.keys(norm)]));

  const idealByCat = {};
  for (const c of cats) idealByCat[c] = (norm[c] || 0) * totalNow;

  const cashSurplus = Math.max(0, (byCat.cash || 0) - (idealByCat.cash || 0));
  const gaps = {};
  for (const c of cats) {
    if (c === "cash") continue;
    gaps[c] = Math.max(0, (idealByCat[c] || 0) - (byCat[c] || 0));
  }

  const sumGaps = Object.values(gaps).reduce((a, b) => a + b, 0) || 1;
  const investPlan = {};
  if (cashSurplus > 0 && sumGaps > 0) {
    investPlan.cash = -cashSurplus;
    for (const c of Object.keys(gaps)) {
      investPlan[c] = (gaps[c] / sumGaps) * cashSurplus;
    }
  }

  return { totalNow, targetTotal: totalNow, byCat, idealByCat, investPlan };
}

export function groupByPeriod(points, mode) {
  const fmt = (d) =>
    mode === "monthly"
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      : `${d.getFullYear()}`;
  const map = new Map();
  for (const p of points || []) {
    const key = fmt(p.date);
    const prev = map.get(key);
    const { date, ...rest } = p;
    if (!prev || p.date.getTime() > prev.lastDate)
      map.set(key, { label: key, lastDate: p.date.getTime(), ...rest });
  }
  return Array.from(map.values()).sort((a, b) => a.lastDate - b.lastDate);
}

export function buildSeries(snaps, period) {
  const pts = (snaps || []).map((s) => {
    const byCat = currentByCategory(s.assets || [], s.liabilities || []);
    return {
      date: new Date(s.asOf),
      value: netWorth(s.assets || [], s.liabilities || []),
      ...byCat,
    };
    });
  const grouped = groupByPeriod(pts, period);
  return grouped.map(({ lastDate, ...rest }) => rest);
}
