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
  investable: { name: "Investable only", description: "Accessible capital outside the managed Financial Portfolio." },
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
    pricingCurrency: asset.pricingCurrency || "EUR",
    valuationMode: asset.valuationMode || "total",
    isCheckingAccount: asset.isCheckingAccount == null ? type === "cash" : !!asset.isCheckingAccount,
    reserveToKeep: asset.reserveToKeep === "" || asset.reserveToKeep == null ? "" : Math.max(0, Number(asset.reserveToKeep) || 0),
    isInvestmentCashAccount: !!asset.isInvestmentCashAccount,
    eligibleForInvestment: asset.eligibleForInvestment == null ? type !== "cash" : !!asset.eligibleForInvestment,
    dimensions: cloneDefaults(asset.dimensions || {}),
    quantity: Number(asset.quantity) || 0,
    unitPrice: Number(asset.unitPrice) || 0,
    fxRate: asset.fxRate == null ? 1 : Number(asset.fxRate) || 0,
    value: Number(asset.value) || 0,
  };
  const withRules = applyAssetTypeRules(normalized, assetTypes, false);
  if (withRules.type !== "cash") {
    withRules.isCheckingAccount = false;
    withRules.reserveToKeep = "";
    withRules.isInvestmentCashAccount = false;
  } else if (withRules.isInvestmentCashAccount) {
    withRules.portfolioScope = "financial";
    withRules.isCheckingAccount = false;
    withRules.reserveToKeep = "";
    withRules.eligibleForInvestment = false;
  }
  return withRules;
}

export function normalizeStoredAsset(asset = {}, assetTypes = defaultAssetTypes) {
  const normalized = normalizeAsset(asset, assetTypes);
  const stored = {
    ...normalized,
    portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : normalized.portfolioScope,
    scopeNeedsReview: !!asset.scopeNeedsReview,
  };
  if (stored.isInvestmentCashAccount) {
    stored.portfolioScope = "financial";
    stored.isCheckingAccount = false;
    stored.reserveToKeep = "";
    stored.eligibleForInvestment = false;
  }
  return stored;
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
  if (!asset) return 0;
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const gross = asset.valuationMode === "units"
    ? (Number(asset.quantity) || 0) * (Number(asset.unitPrice) || 0) * fx
    : (Number(asset.value) || 0) * fx;
  const share = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  return gross * share;
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

function proportionalFlows(sources, destinations, total, kind) {
  const sourceTotal = sources.reduce((sum, item) => sum + item.amount, 0);
  const destinationTotal = destinations.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0 || sourceTotal <= 0 || destinationTotal <= 0) return [];
  const sourceRemaining = sources.map((item) => ({ ...item, remaining: total * item.amount / sourceTotal }));
  const destinationRemaining = destinations.map((item) => ({ ...item, remaining: total * item.amount / destinationTotal }));
  const flows = [];
  let sourceIndex = 0;
  let destinationIndex = 0;
  while (sourceIndex < sourceRemaining.length && destinationIndex < destinationRemaining.length) {
    const source = sourceRemaining[sourceIndex];
    const destination = destinationRemaining[destinationIndex];
    const amount = Math.min(source.remaining, destination.remaining);
    if (amount > 1e-9) {
      flows.push({
        kind,
        fromAssetId: source.asset.id,
        fromName: source.asset.name,
        toAssetId: destination.asset.id,
        toName: destination.asset.name,
        amount,
      });
    }
    source.remaining -= amount;
    destination.remaining -= amount;
    if (source.remaining <= 1e-9) sourceIndex += 1;
    if (destination.remaining <= 1e-9) destinationIndex += 1;
  }
  return flows;
}

export function planCashTransfers(assets, strategy) {
  const activeAssets = assets || [];
  const checkingAccounts = activeAssets.filter((asset) => asset.isCheckingAccount && assetInPortfolioView(asset, "investable"));
  const investmentCashAccounts = activeAssets.filter((asset) => asset.type === "cash" && asset.portfolioScope === "financial" && asset.isInvestmentCashAccount);
  const investmentCashAccount = investmentCashAccounts.length === 1 ? investmentCashAccounts[0] : null;
  const reserveTarget = Math.max(0, Number(strategy?.cashReserveTarget) || 0);
  const checkingCash = checkingAccounts.reduce((sum, asset) => sum + assetValue(asset), 0);
  const explicitAccounts = checkingAccounts.filter((asset) => asset.reserveToKeep !== "" && asset.reserveToKeep != null);
  const automaticAccounts = checkingAccounts.filter((asset) => asset.reserveToKeep === "" || asset.reserveToKeep == null);
  const explicitReserve = explicitAccounts.reduce((sum, asset) => sum + Math.max(0, Number(asset.reserveToKeep) || 0), 0);
  const automaticReserve = automaticAccounts.length ? Math.max(0, reserveTarget - explicitReserve) / automaticAccounts.length : 0;
  const accountReserves = checkingAccounts.map((asset) => ({
    assetId: asset.id,
    name: asset.name,
    current: assetValue(asset),
    reserve: asset.reserveToKeep === "" || asset.reserveToKeep == null
      ? automaticReserve
      : Math.max(0, Number(asset.reserveToKeep) || 0),
    assignment: asset.reserveToKeep === "" || asset.reserveToKeep == null ? "Equal share" : "Specified",
  }));
  const assignedReserve = accountReserves.reduce((sum, account) => sum + account.reserve, 0);
  const effectiveReserveTarget = Math.max(reserveTarget, assignedReserve);
  const warnings = [];
  if (explicitReserve > reserveTarget + 0.01) {
    warnings.push("Specified account reserves exceed the global cash-reserve target; the higher account total is used.");
  } else if (!automaticAccounts.length && assignedReserve < reserveTarget - 0.01) {
    warnings.push("Part of the global cash reserve is not assigned because every checking account has a specified amount.");
  }
  if (investmentCashAccounts.length > 1) {
    warnings.push("More than one investment cash destination is selected. Choose exactly one before transferring cash.");
  }

  const projectedValues = Object.fromEntries(activeAssets.map((asset) => [asset.id, assetValue(asset)]));
  const transfers = [];
  function applyFlows(flows) {
    for (const flow of flows) {
      projectedValues[flow.fromAssetId] = Math.max(0, (projectedValues[flow.fromAssetId] || 0) - flow.amount);
      projectedValues[flow.toAssetId] = (projectedValues[flow.toAssetId] || 0) + flow.amount;
      transfers.push(flow);
    }
  }

  const reserveById = new Map(accountReserves.map((account) => [account.assetId, account.reserve]));
  const checkingSources = () => checkingAccounts
    .map((asset) => ({ asset, amount: Math.max(0, (projectedValues[asset.id] || 0) - (reserveById.get(asset.id) || 0)) }))
    .filter((item) => item.amount > 0.01);
  const checkingDeficits = () => checkingAccounts
    .map((asset) => ({ asset, amount: Math.max(0, (reserveById.get(asset.id) || 0) - (projectedValues[asset.id] || 0)) }))
    .filter((item) => item.amount > 0.01);

  let sources = checkingSources();
  let deficits = checkingDeficits();
  const internalTransfer = Math.min(
    sources.reduce((sum, item) => sum + item.amount, 0),
    deficits.reduce((sum, item) => sum + item.amount, 0)
  );
  applyFlows(proportionalFlows(sources, deficits, internalTransfer, "replenish"));

  deficits = checkingDeficits();
  if (deficits.length && investmentCashAccount) {
    const remainingDeficit = deficits.reduce((sum, item) => sum + item.amount, 0);
    const availableInvestmentCash = Math.max(0, projectedValues[investmentCashAccount.id] || 0);
    const replenishment = Math.min(remainingDeficit, availableInvestmentCash);
    applyFlows(proportionalFlows(
      [{ asset: investmentCashAccount, amount: availableInvestmentCash }],
      deficits,
      replenishment,
      "replenish"
    ));
  }

  deficits = checkingDeficits();
  const reserveShortfall = deficits.reduce((sum, item) => sum + item.amount, 0);
  const checkingCashAfterReplenishment = checkingAccounts.reduce((sum, asset) => sum + (projectedValues[asset.id] || 0), 0);
  const surplus = reserveShortfall <= 0.01
    ? Math.max(0, checkingCashAfterReplenishment - effectiveReserveTarget)
    : 0;
  let transferableSurplus = 0;
  if (surplus > 0.01 && investmentCashAccount) {
    sources = checkingSources();
    transferableSurplus = Math.min(surplus, sources.reduce((sum, item) => sum + item.amount, 0));
    applyFlows(proportionalFlows(
      sources,
      [{ asset: investmentCashAccount, amount: transferableSurplus }],
      transferableSurplus,
      "invest"
    ));
  }

  const projectedAccountReserves = accountReserves.map((account) => ({
    ...account,
    projected: projectedValues[account.assetId] || 0,
  }));
  let reason;
  if (!checkingAccounts.length) {
    reason = "No checking accounts are configured for the cash reserve.";
  } else if (reserveShortfall > 0.01) {
    reason = investmentCashAccount
      ? "Checking-account reserves remain underfunded after using the available investment cash."
      : "Checking-account reserves are underfunded; choose an investment cash destination to replenish them.";
  } else if (surplus > 0.01 && !investmentCashAccount) {
    reason = "Cash is available to invest; choose one Financial cash asset as the investment cash destination.";
  } else if (transferableSurplus > 0.01) {
    reason = "Checking-account reserves are funded and the remaining cash can be transferred for investment.";
  } else if (transfers.some((transfer) => transfer.kind === "replenish")) {
    reason = "Checking-account reserves can be fully replenished; no surplus remains to invest.";
  } else {
    reason = "Checking-account cash is allocated to the configured reserves.";
  }

  return {
    checkingCash,
    reserveTarget,
    effectiveReserveTarget,
    assignedReserve,
    accountReserves: projectedAccountReserves,
    investmentCashAccount,
    investmentCashAccounts,
    transfers,
    reserveShortfall,
    surplus,
    transferableSurplus,
    projectedValues,
    warnings,
    reason,
  };
}

export function recommendSurplusCash(assets, strategy, assetTypes = {}, dimensions = {}) {
  const activeAssets = assets || [];
  const routing = planCashTransfers(activeAssets, strategy);
  const candidates = activeAssets.filter((asset) => asset.portfolioScope === "financial" && asset.eligibleForInvestment && !asset.isCheckingAccount && !asset.isInvestmentCashAccount);
  const initialValues = Object.fromEntries(activeAssets.map((asset) => [asset.id, assetValue(asset)]));
  const result = {
    ...routing,
    plan: [],
    currentValues: initialValues,
    projectedValues: { ...routing.projectedValues },
    currentMetrics: portfolioMetrics(activeAssets, [], initialValues),
    projectedMetrics: portfolioMetrics(activeAssets, [], routing.projectedValues),
    unallocated: 0,
    reason: "",
  };
  if (routing.reserveShortfall > 0.01) {
    result.reason = routing.reason;
    return result;
  }
  if (routing.surplus > 0.01 && !routing.investmentCashAccount) {
    result.reason = routing.reason;
    return result;
  }
  if (routing.transferableSurplus <= 0.01) {
    result.reason = routing.reason;
    return result;
  }
  if (!candidates.length) {
    result.reason = "No assets are marked as eligible for additional investment.";
    result.unallocated = routing.transferableSurplus;
    return result;
  }

  const baseValues = { ...routing.projectedValues };
  const configured = strategyPenalty(activeAssets, strategy, assetTypes, dimensions, baseValues).activePolicies;
  if (!configured) {
    result.reason = "Configure at least one target allocation or limit to generate an investment plan.";
    result.unallocated = routing.transferableSurplus;
    return result;
  }

  const allocations = Object.fromEntries(candidates.map((asset) => [asset.id, 0]));
  const steps = 100;
  const block = routing.transferableSurplus / steps;
  const projected = { ...baseValues };
  for (let index = 0; index < steps; index += 1) {
    let best = null;
    for (const candidate of candidates) {
      const trial = {
        ...projected,
        [routing.investmentCashAccount.id]: Math.max(0, (projected[routing.investmentCashAccount.id] || 0) - block),
        [candidate.id]: (projected[candidate.id] || 0) + block,
      };
      if (worsensMaximumLimit(activeAssets, strategy, assetTypes, dimensions, projected, trial)) continue;
      const score = strategyPenalty(activeAssets, strategy, assetTypes, dimensions, trial).penalty;
      if (!best || score < best.score - 1e-9) best = { candidate, score };
    }
    if (!best) break;
    projected[routing.investmentCashAccount.id] = Math.max(0, (projected[routing.investmentCashAccount.id] || 0) - block);
    projected[best.candidate.id] = (projected[best.candidate.id] || 0) + block;
    allocations[best.candidate.id] += block;
  }
  result.projectedValues = projected;
  result.plan = candidates
    .filter((asset) => allocations[asset.id] > 0.005)
    .map((asset) => ({ assetId: asset.id, name: asset.name, amount: allocations[asset.id] }))
    .sort((a, b) => b.amount - a.amount);
  const allocatedTotal = Object.values(allocations).reduce((sum, amount) => sum + amount, 0);
  result.unallocated = Math.max(0, routing.transferableSurplus - allocatedTotal);
  result.projectedMetrics = portfolioMetrics(activeAssets, [], result.projectedValues);
  result.reason = result.plan.length
    ? result.unallocated > 0.01
      ? "Part of the surplus cannot be allocated without exceeding a configured maximum."
      : "The surplus is distributed to reduce the weighted strategy deviations."
    : "No eligible investment can receive the surplus without exceeding a configured maximum.";
  return result;
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
