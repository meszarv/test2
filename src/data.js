export const defaultDimensions = {
  liquidity: {
    name: "Liquidity",
    values: {
      immediate: { name: "Immediate" },
      days: { name: "Days" },
      weeks: { name: "Weeks" },
      months: { name: "Months" },
      illiquid: { name: "Illiquid" },
    },
  },
  geography: {
    name: "Geography",
    values: {
      domestic: { name: "Domestic" },
      europe: { name: "Europe" },
      north_america: { name: "North America" },
      global: { name: "Global / diversified" },
      other: { name: "Other" },
    },
  },
  investment_strategy: {
    name: "Investment strategy",
    values: {
      cash_reserve: { name: "Cash reserve" },
      capital_preservation: { name: "Capital preservation" },
      income: { name: "Income" },
      balanced_growth: { name: "Balanced growth" },
      long_term_growth: { name: "Long-term growth" },
      speculative: { name: "Speculative" },
    },
  },
  currency_exposure: {
    name: "Currency exposure",
    values: {
      eur: { name: "EUR" },
      usd: { name: "USD" },
      gbp: { name: "GBP" },
      diversified: { name: "Diversified" },
      other: { name: "Other" },
    },
  },
  volatility: {
    name: "Risk / volatility",
    values: {
      low: { name: "Low" },
      medium: { name: "Medium" },
      high: { name: "High" },
      very_high: { name: "Very high" },
    },
  },
  custodian: {
    name: "Custodian",
    values: {
      direct: { name: "Direct ownership" },
    },
  },
  sector: {
    name: "Sector",
    values: {
      diversified: { name: "Diversified" },
      real_estate: { name: "Real estate" },
      financials: { name: "Financials" },
      technology: { name: "Technology" },
      other: { name: "Other" },
    },
  },
  ownership: {
    name: "Ownership",
    values: {
      personal: { name: "Personal" },
      joint: { name: "Joint" },
      company: { name: "Company-owned" },
    },
  },
};

export const defaultAssetTypes = {
  cash: {
    name: "Cash",
    scopeRule: { mode: "default", value: "investable" },
    dimensionRules: {
      liquidity: { mode: "locked", value: "immediate" },
      investment_strategy: { mode: "default", value: "cash_reserve" },
      volatility: { mode: "locked", value: "low" },
      sector: { mode: "na", value: "" },
    },
  },
  real_estate: {
    name: "Real estate",
    scopeRule: { mode: "default", value: "total" },
    dimensionRules: {
      liquidity: { mode: "locked", value: "illiquid" },
      custodian: { mode: "default", value: "direct" },
      sector: { mode: "locked", value: "real_estate" },
      volatility: { mode: "default", value: "medium" },
    },
  },
  stock: {
    name: "Stock",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      investment_strategy: { mode: "default", value: "long_term_growth" },
      volatility: { mode: "default", value: "high" },
    },
  },
  private_equity: {
    name: "Private equity",
    scopeRule: { mode: "default", value: "total" },
    dimensionRules: {
      liquidity: { mode: "default", value: "illiquid" },
      volatility: { mode: "default", value: "very_high" },
    },
  },
  bond: {
    name: "Bond",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      investment_strategy: { mode: "default", value: "income" },
      volatility: { mode: "default", value: "low" },
    },
  },
  commodity: {
    name: "Commodity",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      volatility: { mode: "default", value: "high" },
    },
  },
};

export const defaultLiabilityTypes = {
  credit_card: { name: "Credit card" },
  loan: { name: "Loan" },
  mortgage: { name: "Mortgage" },
};

export const defaultStrategy = {
  cashReserveTarget: 0,
  dimensionPolicies: {
    asset_type: { mode: "informational", tolerance: 2, importance: 3, categories: {} },
    liquidity: { mode: "informational", tolerance: 2, importance: 2, categories: {} },
    geography: { mode: "informational", tolerance: 2, importance: 2, categories: {} },
    investment_strategy: { mode: "informational", tolerance: 2, importance: 2, categories: {} },
    currency_exposure: { mode: "informational", tolerance: 2, importance: 1, categories: {} },
    volatility: { mode: "informational", tolerance: 2, importance: 2, categories: {} },
    custodian: { mode: "informational", tolerance: 2, importance: 1, categories: {} },
    sector: { mode: "informational", tolerance: 2, importance: 1, categories: {} },
    ownership: { mode: "informational", tolerance: 2, importance: 1, categories: {} },
  },
};

export const dimensionKeys = ["asset_type", ...Object.keys(defaultDimensions)];

export const portfolioViews = {
  total: { name: "Total Net Worth", assetLabel: "Total Assets" },
  investable: { name: "Investable Assets", assetLabel: "Investable Assets" },
  financial: { name: "Financial Portfolio", assetLabel: "Financial Portfolio" },
};

export const portfolioScopeOptions = {
  total: { name: "Total only", description: "Material wealth outside accessible investment capital." },
  investable: { name: "Investable", description: "Accessible capital outside or inside the managed strategy." },
  financial: { name: "Financial Portfolio", description: "Assets actively managed under the investment strategy." },
};

export function validPortfolioScope(value) {
  return Object.prototype.hasOwnProperty.call(portfolioScopeOptions, value);
}

export function cloneDefaults(value) {
  return JSON.parse(JSON.stringify(value));
}

export function mergeDimensions(dimensions = {}) {
  const merged = cloneDefaults(defaultDimensions);
  for (const [key, def] of Object.entries(dimensions || {})) {
    merged[key] = {
      ...(merged[key] || {}),
      ...def,
      values: { ...(merged[key]?.values || {}), ...(def?.values || {}) },
    };
  }
  return merged;
}

export function mergeStrategy(strategy = {}, legacyAllocation = {}) {
  const base = cloneDefaults(defaultStrategy);
  const policies = strategy.dimensionPolicies || {};
  for (const key of dimensionKeys) {
    base.dimensionPolicies[key] = {
      ...base.dimensionPolicies[key],
      ...(policies[key] || {}),
      categories: {
        ...(base.dimensionPolicies[key]?.categories || {}),
        ...(policies[key]?.categories || {}),
      },
    };
  }
  base.cashReserveTarget = Number(strategy.cashReserveTarget) || 0;
  if (Object.keys(legacyAllocation || {}).length && !Object.keys(policies.asset_type?.categories || {}).length) {
    base.dimensionPolicies.asset_type = {
      ...base.dimensionPolicies.asset_type,
      mode: "target",
      categories: Object.fromEntries(
        Object.entries(legacyAllocation).map(([key, target]) => [
          key,
          { target: Number(target) || 0, min: "", max: "" },
        ])
      ),
    };
  }
  return base;
}

export function normalizeAsset(asset = {}, assetTypes = defaultAssetTypes) {
  const type = asset.type || Object.keys(assetTypes)[0] || "cash";
  const scopeRule = assetTypes[type]?.scopeRule;
  const inferredScope = scopeRule?.value && validPortfolioScope(scopeRule.value) ? scopeRule.value : "total";
  const normalized = {
    id: asset.id || "",
    name: asset.name || assetTypes[type]?.name || type,
    type,
    portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : inferredScope,
    scopeNeedsReview: !!asset.scopeNeedsReview,
    description: asset.description || "",
    ownership: asset.ownership || "personal",
    ownershipShare: asset.ownershipShare == null ? 100 : Number(asset.ownershipShare),
    acquiredOn: asset.acquiredOn || "",
    status: asset.status || "active",
    pricingCurrency: asset.pricingCurrency || "EUR",
    valuationMode: asset.valuationMode || "total",
    isCheckingAccount: asset.isCheckingAccount == null ? type === "cash" : !!asset.isCheckingAccount,
    eligibleForInvestment: asset.eligibleForInvestment == null ? type !== "cash" : !!asset.eligibleForInvestment,
    dimensions: cloneDefaults(asset.dimensions || {}),
    quantity: Number(asset.quantity) || 0,
    unitPrice: Number(asset.unitPrice) || 0,
    fxRate: asset.fxRate == null ? 1 : Number(asset.fxRate) || 0,
    value: Number(asset.value) || 0,
    costBasis: Number(asset.costBasis) || 0,
    valuationDate: asset.valuationDate || "",
    notes: asset.notes || "",
  };
  return applyAssetTypeRules(normalized, assetTypes, false);
}

export function normalizeStoredAsset(asset = {}, assetTypes = defaultAssetTypes) {
  const normalized = normalizeAsset(asset, assetTypes);
  return {
    ...normalized,
    portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : normalized.portfolioScope,
    scopeNeedsReview: !!asset.scopeNeedsReview,
  };
}

export function applyAssetTypeRules(asset, assetTypes, overwriteDefaults = false) {
  const out = { ...asset, dimensions: cloneDefaults(asset.dimensions || {}) };
  const scopeRule = assetTypes?.[out.type]?.scopeRule;
  if (scopeRule?.mode === "locked" && validPortfolioScope(scopeRule.value)) {
    out.portfolioScope = scopeRule.value;
  } else if (
    scopeRule?.mode === "default" &&
    validPortfolioScope(scopeRule.value) &&
    (overwriteDefaults || !validPortfolioScope(out.portfolioScope))
  ) {
    out.portfolioScope = scopeRule.value;
  }
  const rules = assetTypes?.[out.type]?.dimensionRules || {};
  for (const [dimension, rule] of Object.entries(rules)) {
    if (rule.mode === "na") {
      delete out.dimensions[dimension];
    } else if (rule.mode === "locked" && rule.value) {
      out.dimensions[dimension] = { [rule.value]: 100 };
    } else if (rule.mode === "default" && rule.value && (overwriteDefaults || !Object.keys(out.dimensions[dimension] || {}).length)) {
      out.dimensions[dimension] = { [rule.value]: 100 };
    }
  }
  return out;
}

export function assetValue(asset) {
  if (!asset || asset.status === "closed" || asset.status === "sold") return 0;
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const gross = asset.valuationMode === "units"
    ? (Number(asset.quantity) || 0) * (Number(asset.unitPrice) || 0) * fx
    : (Number(asset.value) || 0) * fx;
  const share = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  return gross * share;
}

export function costBasisValue(asset) {
  if (!asset) return 0;
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const share = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  return (Number(asset.costBasis) || 0) * fx * share;
}

export function netWorth(assets, liabilities) {
  const assetTotal = (assets || []).reduce((acc, asset) => acc + assetValue(asset), 0);
  const liabilityTotal = (liabilities || []).reduce((acc, liability) => acc + (Number(liability.value) || 0), 0);
  return assetTotal - liabilityTotal;
}

export function totalAssets(assets) {
  return (assets || []).reduce((sum, asset) => sum + assetValue(asset), 0);
}

export function assetInPortfolioView(asset, view = "total") {
  if (!asset) return false;
  if (view === "total") return true;
  if (view === "investable") return asset.portfolioScope === "investable" || asset.portfolioScope === "financial";
  if (view === "financial") return asset.portfolioScope === "financial";
  return false;
}

export function assetsForPortfolioView(assets, view = "total") {
  return (assets || []).filter((asset) => assetInPortfolioView(asset, view));
}

export function assetTotalForView(assets, view = "total", valueOverrides = {}) {
  return (assets || []).reduce((sum, asset) => {
    if (!assetInPortfolioView(asset, view)) return sum;
    if (asset.status === "closed" || asset.status === "sold") return sum;
    const value = Object.prototype.hasOwnProperty.call(valueOverrides, asset.id)
      ? Number(valueOverrides[asset.id]) || 0
      : assetValue(asset);
    return sum + value;
  }, 0);
}

export function portfolioMetrics(assets, liabilities = [], valueOverrides = {}) {
  const total = assetTotalForView(assets, "total", valueOverrides);
  const investable = assetTotalForView(assets, "investable", valueOverrides);
  const financial = assetTotalForView(assets, "financial", valueOverrides);
  const debt = (liabilities || []).reduce((sum, liability) => sum + (Number(liability.value) || 0), 0);
  return {
    totalAssets: total,
    totalLiabilities: debt,
    totalNetWorth: total - debt,
    investableAssets: investable,
    financialPortfolio: financial,
  };
}

export function dimensionRegistry(key, assetTypes, dimensions) {
  if (key === "asset_type") return assetTypes || {};
  return dimensions?.[key]?.values || {};
}

export function dimensionName(key, dimensions) {
  return key === "asset_type" ? "Asset type" : dimensions?.[key]?.name || key;
}

export function exposureForAsset(asset, key, assetTypes = {}) {
  if (key === "asset_type") return { [asset.type || "unclassified"]: 100 };
  if (key === "ownership") return { [asset.ownership || "unclassified"]: 100 };
  const rule = assetTypes?.[asset.type]?.dimensionRules?.[key];
  if (rule?.mode === "na") return {};
  if (rule?.mode === "locked" && rule.value) return { [rule.value]: 100 };
  const raw = asset.dimensions?.[key] || {};
  const positive = Object.entries(raw).filter(([, pct]) => Number(pct) > 0);
  if (!positive.length) {
    if (rule?.mode === "default" && rule.value) return { [rule.value]: 100 };
    return { unclassified: 100 };
  }
  const total = positive.reduce((sum, [, pct]) => sum + Number(pct), 0) || 1;
  return Object.fromEntries(positive.map(([value, pct]) => [value, (Number(pct) / total) * 100]));
}

export function currentByDimension(assets, key, assetTypes = {}, valueOverrides = {}, portfolioView = "total") {
  const amounts = {};
  for (const asset of assets || []) {
    if (!assetInPortfolioView(asset, portfolioView)) continue;
    if (asset.status === "closed" || asset.status === "sold") continue;
    const value = Object.prototype.hasOwnProperty.call(valueOverrides, asset.id)
      ? Number(valueOverrides[asset.id]) || 0
      : assetValue(asset);
    if (value <= 0) continue;
    const exposures = exposureForAsset(asset, key, assetTypes);
    const entries = Object.entries(exposures);
    if (!entries.length) continue;
    for (const [category, percentage] of entries) {
      amounts[category] = (amounts[category] || 0) + value * ((Number(percentage) || 0) / 100);
    }
  }
  return amounts;
}

export function concentrationRows(assets, key, policy = {}, assetTypes = {}, dimensions = {}, valueOverrides = {}, portfolioView = "total") {
  const amounts = currentByDimension(assets, key, assetTypes, valueOverrides, portfolioView);
  const total = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  const registry = dimensionRegistry(key, assetTypes, dimensions);
  const categories = policy.categories || {};
  const keys = Array.from(new Set([...Object.keys(registry), ...Object.keys(amounts), ...Object.keys(categories)]));
  const tolerance = Number(policy.tolerance) || 0;
  return keys.map((category) => {
    const amount = amounts[category] || 0;
    const current = total > 0 ? (amount / total) * 100 : 0;
    const config = categories[category] || {};
    const target = config.target === "" || config.target == null ? null : Number(config.target);
    const min = config.min === "" || config.min == null ? null : Number(config.min);
    const max = config.max === "" || config.max == null ? null : Number(config.max);
    let status = "On track";
    let difference = null;
    if (policy.mode === "target" && target != null) {
      difference = current - target;
      if (difference < -tolerance) status = "Under target";
      else if (difference > tolerance) status = "Over target";
    } else if (policy.mode === "limits") {
      if (min != null && current < min) status = "Below minimum";
      else if (max != null && current > max) status = "Above maximum";
    } else {
      status = "Informational";
    }
    return {
      category,
      label: registry[category]?.name || (category === "unclassified" ? "Unclassified" : category),
      amount,
      current,
      target,
      min,
      max,
      difference,
      status,
    };
  });
}

function strategyPenalty(assets, strategy, assetTypes, dimensions, valueOverrides) {
  let penalty = 0;
  let activePolicies = 0;
  for (const [key, policy] of Object.entries(strategy?.dimensionPolicies || {})) {
    if (policy.mode !== "target" && policy.mode !== "limits") continue;
    activePolicies += 1;
    const importance = Math.max(0.1, Number(policy.importance) || 1);
    for (const row of concentrationRows(assets, key, policy, assetTypes, dimensions, valueOverrides, "financial")) {
      if (policy.mode === "target" && row.target != null) {
        penalty += Math.max(0, Math.abs(row.current - row.target) - (Number(policy.tolerance) || 0)) * importance;
      } else if (policy.mode === "limits") {
        if (row.min != null) penalty += Math.max(0, row.min - row.current) * importance;
        if (row.max != null) penalty += Math.max(0, row.current - row.max) * importance;
      }
    }
  }
  return { penalty, activePolicies };
}

function worsensMaximumLimit(assets, strategy, assetTypes, dimensions, currentValues, trialValues) {
  for (const [key, policy] of Object.entries(strategy?.dimensionPolicies || {})) {
    if (policy.mode !== "limits") continue;
    const before = new Map(concentrationRows(assets, key, policy, assetTypes, dimensions, currentValues, "financial").map((row) => [row.category, row]));
    const after = concentrationRows(assets, key, policy, assetTypes, dimensions, trialValues, "financial");
    for (const row of after) {
      if (row.max == null || row.current <= row.max + 1e-9) continue;
      const previous = before.get(row.category)?.current || 0;
      if (row.current > previous + 1e-9) return true;
    }
  }
  return false;
}

export function recommendSurplusCash(assets, strategy, assetTypes = {}, dimensions = {}) {
  const activeAssets = (assets || []).filter((asset) => asset.status !== "closed" && asset.status !== "sold");
  const checking = activeAssets.filter((asset) => asset.isCheckingAccount && assetInPortfolioView(asset, "investable"));
  const checkingCash = checking.reduce((sum, asset) => sum + assetValue(asset), 0);
  const reserveTarget = Math.max(0, Number(strategy?.cashReserveTarget) || 0);
  const surplus = Math.max(0, checkingCash - reserveTarget);
  const candidates = activeAssets.filter((asset) => asset.portfolioScope === "financial" && asset.eligibleForInvestment && !asset.isCheckingAccount);
  const initialValues = Object.fromEntries(activeAssets.map((asset) => [asset.id, assetValue(asset)]));
  const result = {
    checkingCash,
    reserveTarget,
    surplus,
    plan: [],
    currentValues: initialValues,
    projectedValues: { ...initialValues },
    currentMetrics: portfolioMetrics(activeAssets, [], initialValues),
    projectedMetrics: portfolioMetrics(activeAssets, [], initialValues),
    unallocated: 0,
    reason: "",
  };
  if (surplus <= 0) {
    result.reason = "Checking-account cash is within the configured reserve.";
    return result;
  }
  if (!candidates.length) {
    result.reason = "No assets are marked as eligible for additional investment.";
    return result;
  }

  const baseValues = { ...initialValues };
  for (const asset of checking) {
    const current = baseValues[asset.id] || 0;
    const share = checkingCash > 0 ? current / checkingCash : 0;
    baseValues[asset.id] = Math.max(0, current - surplus * share);
  }
  const configured = strategyPenalty(activeAssets, strategy, assetTypes, dimensions, baseValues).activePolicies;
  if (!configured) {
    result.reason = "Configure at least one target allocation or limit to generate an investment plan.";
    return result;
  }

  const allocations = Object.fromEntries(candidates.map((asset) => [asset.id, 0]));
  const steps = 100;
  const block = surplus / steps;
  const projected = { ...baseValues };
  for (let index = 0; index < steps; index += 1) {
    let best = null;
    for (const candidate of candidates) {
      const trial = { ...projected, [candidate.id]: (projected[candidate.id] || 0) + block };
      if (worsensMaximumLimit(activeAssets, strategy, assetTypes, dimensions, projected, trial)) continue;
      const score = strategyPenalty(activeAssets, strategy, assetTypes, dimensions, trial).penalty;
      if (!best || score < best.score - 1e-9) best = { candidate, score };
    }
    if (!best) break;
    projected[best.candidate.id] = (projected[best.candidate.id] || 0) + block;
    allocations[best.candidate.id] += block;
  }
  result.projectedValues = projected;
  result.plan = candidates
    .filter((asset) => allocations[asset.id] > 0.005)
    .map((asset) => ({ assetId: asset.id, name: asset.name, amount: allocations[asset.id] }))
    .sort((a, b) => b.amount - a.amount);
  const allocatedTotal = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  result.unallocated = Math.max(0, surplus - allocatedTotal);
  if (result.unallocated > 0) {
    for (const asset of checking) {
      const current = initialValues[asset.id] || 0;
      const share = checkingCash > 0 ? current / checkingCash : 0;
      result.projectedValues[asset.id] = (result.projectedValues[asset.id] || 0) + result.unallocated * share;
    }
  }
  result.projectedMetrics = portfolioMetrics(activeAssets, [], result.projectedValues);
  result.reason = result.plan.length
    ? result.unallocated > 0.01
      ? "Part of the surplus cannot be allocated without exceeding a configured maximum."
      : "The surplus is distributed to reduce the weighted strategy deviations."
    : "No eligible investment can receive the surplus without exceeding a configured maximum.";
  return result;
}

export function annualIncomeSummary(records, year = null) {
  const filtered = (records || []).filter((record) => year == null || Number(record.year) === Number(year));
  const grossFields = ["dividends", "interest", "rent", "distributions", "otherIncome"];
  const costFields = ["fees", "repairs", "otherCosts"];
  const gross = filtered.reduce((sum, record) => sum + grossFields.reduce((subtotal, field) => subtotal + (Number(record[field]) || 0), 0), 0);
  const costs = filtered.reduce((sum, record) => sum + costFields.reduce((subtotal, field) => subtotal + (Number(record[field]) || 0), 0), 0);
  return { gross, costs, net: gross - costs };
}

// Legacy category calculation retained for old rebalance behavior and compatibility tests.
export function currentByCategory(assets, liabilities) {
  const assetMap = {};
  for (const asset of assets || []) {
    const key = asset.type;
    assetMap[key] = (assetMap[key] || 0) + (Number(asset.value) || 0);
  }
  const assetTotal = Object.values(assetMap).reduce((a, b) => a + b, 0);
  const liabilityTotal = (liabilities || []).reduce((a, liability) => a + (Number(liability.value) || 0), 0);
  if (assetTotal === 0) return {};
  const ratio = liabilityTotal / assetTotal;
  return Object.fromEntries(Object.entries(assetMap).map(([key, value]) => [key, value - value * ratio]));
}

export function normalizeAllocation(allocation) {
  const total = Object.values(allocation).reduce((sum, value) => sum + (Number(value) || 0), 0) || 1;
  return Object.fromEntries(Object.keys(allocation).map((key) => [key, (Number(allocation[key]) || 0) / total]));
}

export function rebalance(assets, liabilities, allocationPercentages) {
  const adjustedAssets = (assets || []).map((asset) => ({ ...asset }));
  const adjustedLiabilities = (liabilities || []).map((liability) => ({ ...liability }));
  let cashAvailable = adjustedAssets.filter((asset) => asset.type === "cash").reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
  const initialCash = cashAvailable;
  for (const liability of adjustedLiabilities) {
    if (!liability.priority) continue;
    const payoff = Math.min(cashAvailable, Number(liability.value) || 0);
    liability.value = (Number(liability.value) || 0) - payoff;
    cashAvailable -= payoff;
  }
  const priorityPayoff = initialCash - cashAvailable;
  const priorityDebt = adjustedLiabilities.filter((liability) => liability.priority).reduce((sum, liability) => sum + (Number(liability.value) || 0), 0);
  const nonPriorityLiabilities = adjustedLiabilities.filter((liability) => !liability.priority);
  const byCategoryBeforePayoff = currentByCategory(adjustedAssets, nonPriorityLiabilities);
  let toDeduct = priorityPayoff;
  for (const asset of adjustedAssets) {
    if (asset.type !== "cash" || toDeduct <= 0) continue;
    const available = Number(asset.value) || 0;
    const used = Math.min(available, toDeduct);
    asset.value = available - used;
    toDeduct -= used;
  }
  const totalNow = netWorth(adjustedAssets, adjustedLiabilities);
  const byCat = currentByCategory(adjustedAssets, nonPriorityLiabilities);
  let normalized = normalizeAllocation(allocationPercentages);
  if (!Object.keys(normalized).length) {
    const categories = Object.keys(byCat);
    const share = 1 / (categories.length || 1);
    normalized = Object.fromEntries(categories.map((category) => [category, share]));
  }
  const categories = Array.from(new Set([...Object.keys(byCat), ...Object.keys(normalized)]));
  const idealByCat = Object.fromEntries(categories.map((category) => [category, (normalized[category] || 0) * totalNow]));
  const cashSurplus = Math.max(0, (byCat.cash || 0) - (idealByCat.cash || 0));
  const gaps = Object.fromEntries(categories.filter((category) => category !== "cash").map((category) => [category, Math.max(0, (idealByCat[category] || 0) - (byCat[category] || 0))]));
  const totalGaps = Object.values(gaps).reduce((sum, gap) => sum + gap, 0) || 1;
  const investPlan = {};
  if (cashSurplus > 0 && totalGaps > 0) {
    investPlan.cash = -cashSurplus;
    for (const category of Object.keys(gaps)) investPlan[category] = (gaps[category] / totalGaps) * cashSurplus;
  }
  return {
    totalNow,
    targetTotal: totalNow,
    byCat,
    idealByCat,
    investPlan,
    priorityDebt,
    priorityPayoff,
    cashCurrent: byCategoryBeforePayoff.cash || 0,
  };
}

export function groupByPeriod(points, mode) {
  const format = (date) => mode === "monthly"
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    : `${date.getFullYear()}`;
  const map = new Map();
  for (const point of points || []) {
    const key = format(point.date);
    const previous = map.get(key);
    const { date, ...rest } = point;
    if (!previous || point.date.getTime() > previous.lastDate) map.set(key, { label: key, lastDate: point.date.getTime(), ...rest });
  }
  return Array.from(map.values()).sort((a, b) => a.lastDate - b.lastDate);
}

export function buildSeries(snapshots, period, portfolioView = "total", assetTypes = {}) {
  const points = (snapshots || []).map((snapshot) => {
    const metrics = portfolioMetrics(snapshot.assets || [], snapshot.liabilities || []);
    const value = portfolioView === "total"
      ? metrics.totalNetWorth
      : portfolioView === "investable"
      ? metrics.investableAssets
      : metrics.financialPortfolio;
    return {
      date: new Date(snapshot.asOf),
      value,
      ...currentByDimension(snapshot.assets || [], "asset_type", assetTypes, {}, portfolioView),
    };
  });
  return groupByPeriod(points, period).map(({ lastDate: _lastDate, ...rest }) => rest);
}

export function buildPortfolioComparisonSeries(snapshots, period) {
  const points = (snapshots || []).map((snapshot) => {
    const metrics = portfolioMetrics(snapshot.assets || [], snapshot.liabilities || []);
    return {
      date: new Date(snapshot.asOf),
      totalAssets: metrics.totalAssets,
      investableAssets: metrics.investableAssets,
      financialPortfolio: metrics.financialPortfolio,
    };
  });
  return groupByPeriod(points, period).map(({ lastDate: _lastDate, ...rest }) => rest);
}
