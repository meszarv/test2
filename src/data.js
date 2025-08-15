export const defaultAssetTypes = {
  cash: { name: "Cash" },
  real_estate: { name: "Real estate" },
  stock: { name: "Stock" },
  private_equity: { name: "Private equity" },
  bond: { name: "Bond" },
  commodity: { name: "Commodity" },
};

export function netWorth(assets) {
  return (assets || []).reduce((acc, a) => acc + (Number(a.value) || 0), 0);
}

export function currentByCategory(assets) {
  const map = {};
  for (const a of assets || []) {
    const key = a.type;
    map[key] = (map[key] || 0) + (Number(a.value) || 0);
  }
  return map;
}

export function normalizeAllocation(alloc) {
  const total = Object.values(alloc).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const out = {};
  for (const k of Object.keys(alloc)) out[k] = (Number(alloc[k]) || 0) / total;
  return out; // fractions summing to ~1
}

export function rebalance(assets, allocPct) {
  const totalNow = netWorth(assets);
  const byCat = currentByCategory(assets);
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
    const byCat = currentByCategory(s.assets || []);
    return {
      date: new Date(s.asOf),
      value: netWorth(s.assets || []),
      ...byCat,
    };
    });
  const grouped = groupByPeriod(pts, period);
  return grouped.map(({ lastDate, ...rest }) => rest);
}
