import { j as jsxRuntimeExports, r as reactExports, R as ReactDOM, a as React } from "./vendor-B1sYnIZH.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const defaultDimensions = {
  liquidity: {
    name: "Liquidity",
    values: {
      immediate: { name: "Immediate" },
      days: { name: "Days" },
      weeks: { name: "Weeks" },
      months: { name: "Months" },
      illiquid: { name: "Illiquid" }
    }
  },
  geography: {
    name: "Geography",
    values: {
      domestic: { name: "Domestic" },
      europe: { name: "Europe" },
      north_america: { name: "North America" },
      global: { name: "Global / diversified" },
      other: { name: "Other" }
    }
  },
  investment_strategy: {
    name: "Investment strategy",
    values: {
      cash_reserve: { name: "Cash reserve" },
      capital_preservation: { name: "Capital preservation" },
      income: { name: "Income" },
      balanced_growth: { name: "Balanced growth" },
      long_term_growth: { name: "Long-term growth" },
      speculative: { name: "Speculative" }
    }
  },
  currency_exposure: {
    name: "Currency exposure",
    values: {
      eur: { name: "EUR" },
      usd: { name: "USD" },
      gbp: { name: "GBP" },
      diversified: { name: "Diversified" },
      other: { name: "Other" }
    }
  },
  volatility: {
    name: "Risk / volatility",
    values: {
      low: { name: "Low" },
      medium: { name: "Medium" },
      high: { name: "High" },
      very_high: { name: "Very high" }
    }
  },
  custodian: {
    name: "Custodian",
    values: {
      direct: { name: "Direct ownership" }
    }
  },
  sector: {
    name: "Sector",
    values: {
      diversified: { name: "Diversified" },
      real_estate: { name: "Real estate" },
      financials: { name: "Financials" },
      technology: { name: "Technology" },
      other: { name: "Other" }
    }
  },
  ownership: {
    name: "Ownership",
    values: {
      personal: { name: "Personal" },
      joint: { name: "Joint" },
      company: { name: "Company-owned" }
    }
  }
};
const defaultAssetTypes = {
  cash: {
    name: "Cash",
    scopeRule: { mode: "default", value: "investable" },
    dimensionRules: {
      liquidity: { mode: "locked", value: "immediate" },
      investment_strategy: { mode: "default", value: "cash_reserve" },
      volatility: { mode: "locked", value: "low" },
      sector: { mode: "na", value: "" }
    }
  },
  real_estate: {
    name: "Real estate",
    scopeRule: { mode: "default", value: "total" },
    dimensionRules: {
      liquidity: { mode: "locked", value: "illiquid" },
      custodian: { mode: "default", value: "direct" },
      sector: { mode: "locked", value: "real_estate" },
      volatility: { mode: "default", value: "medium" }
    }
  },
  stock: {
    name: "Stock",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      investment_strategy: { mode: "default", value: "long_term_growth" },
      volatility: { mode: "default", value: "high" }
    }
  },
  private_equity: {
    name: "Private equity",
    scopeRule: { mode: "default", value: "total" },
    dimensionRules: {
      liquidity: { mode: "default", value: "illiquid" },
      volatility: { mode: "default", value: "very_high" }
    }
  },
  bond: {
    name: "Bond",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      investment_strategy: { mode: "default", value: "income" },
      volatility: { mode: "default", value: "low" }
    }
  },
  commodity: {
    name: "Commodity",
    scopeRule: { mode: "default", value: "financial" },
    dimensionRules: {
      liquidity: { mode: "default", value: "days" },
      volatility: { mode: "default", value: "high" }
    }
  }
};
const defaultLiabilityTypes = {
  credit_card: { name: "Credit card" },
  loan: { name: "Loan" },
  mortgage: { name: "Mortgage" }
};
const defaultStrategy = {
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
    ownership: { mode: "informational", tolerance: 2, importance: 1, categories: {} }
  }
};
const dimensionKeys = ["asset_type", ...Object.keys(defaultDimensions)];
const portfolioViews = {
  total: { name: "Total Net Worth", assetLabel: "Total Assets" },
  investable: { name: "Investable Assets", assetLabel: "Investable Assets" },
  financial: { name: "Financial Portfolio", assetLabel: "Financial Portfolio" }
};
const portfolioScopeOptions = {
  total: { name: "Total only", description: "Material wealth outside accessible investment capital." },
  investable: { name: "Investable only", description: "Accessible capital outside the managed Financial Portfolio." },
  financial: { name: "Financial Portfolio", description: "Assets actively managed under the investment strategy." }
};
function validPortfolioScope(value) {
  return Object.prototype.hasOwnProperty.call(portfolioScopeOptions, value);
}
function cloneDefaults(value) {
  return JSON.parse(JSON.stringify(value));
}
function mergeDimensions(dimensions = {}) {
  const merged = cloneDefaults(defaultDimensions);
  for (const [key, def] of Object.entries(dimensions || {})) {
    merged[key] = {
      ...merged[key] || {},
      ...def,
      values: { ...merged[key]?.values || {}, ...def?.values || {} }
    };
  }
  return merged;
}
function mergeStrategy(strategy = {}, legacyAllocation = {}) {
  const base = cloneDefaults(defaultStrategy);
  const policies = strategy.dimensionPolicies || {};
  for (const key of dimensionKeys) {
    base.dimensionPolicies[key] = {
      ...base.dimensionPolicies[key],
      ...policies[key] || {},
      categories: {
        ...base.dimensionPolicies[key]?.categories || {},
        ...policies[key]?.categories || {}
      }
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
          { target: Number(target) || 0, min: "", max: "" }
        ])
      )
    };
  }
  return base;
}
function normalizeAsset(asset = {}, assetTypes = defaultAssetTypes) {
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
    value: Number(asset.value) || 0
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
function normalizeStoredAsset(asset = {}, assetTypes = defaultAssetTypes) {
  const normalized = normalizeAsset(asset, assetTypes);
  const stored = {
    ...normalized,
    portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : normalized.portfolioScope,
    scopeNeedsReview: !!asset.scopeNeedsReview
  };
  if (stored.isInvestmentCashAccount) {
    stored.portfolioScope = "financial";
    stored.isCheckingAccount = false;
    stored.reserveToKeep = "";
    stored.eligibleForInvestment = false;
  }
  return stored;
}
function applyAssetTypeRules(asset, assetTypes, overwriteDefaults = false) {
  const out = { ...asset, dimensions: cloneDefaults(asset.dimensions || {}) };
  const scopeRule = assetTypes?.[out.type]?.scopeRule;
  if (scopeRule?.mode === "locked" && validPortfolioScope(scopeRule.value)) {
    out.portfolioScope = scopeRule.value;
  } else if (scopeRule?.mode === "default" && validPortfolioScope(scopeRule.value) && (overwriteDefaults || !validPortfolioScope(out.portfolioScope))) {
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
function assetValue(asset) {
  if (!asset) return 0;
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const gross = asset.valuationMode === "units" ? (Number(asset.quantity) || 0) * (Number(asset.unitPrice) || 0) * fx : (Number(asset.value) || 0) * fx;
  const share = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  return gross * share;
}
function assetInPortfolioView(asset, view = "total") {
  if (!asset) return false;
  if (view === "total") return true;
  if (view === "investable") return asset.portfolioScope === "investable" || asset.portfolioScope === "financial";
  if (view === "financial") return asset.portfolioScope === "financial";
  return false;
}
function assetTotalForView(assets, view = "total", valueOverrides = {}) {
  return (assets || []).reduce((sum, asset) => {
    if (!assetInPortfolioView(asset, view)) return sum;
    const value = Object.prototype.hasOwnProperty.call(valueOverrides, asset.id) ? Number(valueOverrides[asset.id]) || 0 : assetValue(asset);
    return sum + value;
  }, 0);
}
function portfolioMetrics(assets, liabilities = [], valueOverrides = {}) {
  const total = assetTotalForView(assets, "total", valueOverrides);
  const investable = assetTotalForView(assets, "investable", valueOverrides);
  const financial = assetTotalForView(assets, "financial", valueOverrides);
  const debt = (liabilities || []).reduce((sum, liability) => sum + (Number(liability.value) || 0), 0);
  return {
    totalAssets: total,
    totalLiabilities: debt,
    totalNetWorth: total - debt,
    investableAssets: investable,
    financialPortfolio: financial
  };
}
function dimensionRegistry(key, assetTypes, dimensions) {
  if (key === "asset_type") return assetTypes || {};
  return dimensions?.[key]?.values || {};
}
function dimensionName(key, dimensions) {
  return key === "asset_type" ? "Asset type" : dimensions?.[key]?.name || key;
}
function exposureForAsset(asset, key, assetTypes = {}) {
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
  return Object.fromEntries(positive.map(([value, pct]) => [value, Number(pct) / total * 100]));
}
function currentByDimension(assets, key, assetTypes = {}, valueOverrides = {}, portfolioView = "total") {
  const amounts = {};
  for (const asset of assets || []) {
    if (!assetInPortfolioView(asset, portfolioView)) continue;
    const value = Object.prototype.hasOwnProperty.call(valueOverrides, asset.id) ? Number(valueOverrides[asset.id]) || 0 : assetValue(asset);
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
function concentrationRows(assets, key, policy = {}, assetTypes = {}, dimensions = {}, valueOverrides = {}, portfolioView = "total") {
  const amounts = currentByDimension(assets, key, assetTypes, valueOverrides, portfolioView);
  const total = Object.values(amounts).reduce((sum, amount) => sum + amount, 0);
  const registry = dimensionRegistry(key, assetTypes, dimensions);
  const categories = policy.categories || {};
  const keys = Array.from(/* @__PURE__ */ new Set([...Object.keys(registry), ...Object.keys(amounts), ...Object.keys(categories)]));
  const tolerance = Number(policy.tolerance) || 0;
  return keys.map((category) => {
    const amount = amounts[category] || 0;
    const current = total > 0 ? amount / total * 100 : 0;
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
      status
    };
  });
}
function configuredPercentage(value) {
  if (value === "" || value == null) return null;
  const percentage = Number(value);
  return Number.isFinite(percentage) ? percentage : null;
}
function createStrategyEvaluator(assets, strategy, assetTypes, dimensions, currentValues) {
  const policies = [];
  for (const [key, policy] of Object.entries(strategy?.dimensionPolicies || {})) {
    if (policy.mode !== "target" && policy.mode !== "limits") continue;
    const categories = policy.categories || {};
    const configuredCategories = Object.entries(categories).filter(([, config]) => policy.mode === "target" ? configuredPercentage(config.target) != null : configuredPercentage(config.min) != null || configuredPercentage(config.max) != null);
    if (!configuredCategories.length) continue;
    const currentRows = new Map(
      concentrationRows(assets, key, policy, assetTypes, dimensions, currentValues, "financial").map((row) => [row.category, row])
    );
    policies.push({
      key,
      policy,
      configuredCategories,
      currentRows,
      importance: Math.max(0.1, Number(policy.importance) || 1)
    });
  }
  function evaluate(valueOverrides, investedFraction = 0) {
    let maximumWorsening = 0;
    let limitViolation = 0;
    let targetDeviation = 0;
    for (const configuredPolicy of policies) {
      const { key, policy, configuredCategories, currentRows, importance } = configuredPolicy;
      const projectedRows = new Map(
        concentrationRows(assets, key, policy, assetTypes, dimensions, valueOverrides, "financial").map((row) => [row.category, row])
      );
      let policyMaximumWorsening = 0;
      let policyLimitViolation = 0;
      let policyTargetDeviation = 0;
      for (const [category, config] of configuredCategories) {
        const current = currentRows.get(category)?.current || 0;
        const projected = projectedRows.get(category)?.current || 0;
        if (policy.mode === "target") {
          const target = configuredPercentage(config.target);
          const tolerance = Math.max(0, Number(policy.tolerance) || 0);
          const deviation = Math.max(0, Math.abs(projected - target) - tolerance);
          const scale = Math.max(1, Math.abs(target), tolerance);
          policyTargetDeviation += (deviation / scale) ** 2;
          continue;
        }
        const minimum = configuredPercentage(config.min);
        const maximum = configuredPercentage(config.max);
        if (minimum != null) {
          const violation = Math.max(0, minimum - projected) / Math.max(1, Math.abs(minimum));
          policyLimitViolation += violation ** 2;
        }
        if (maximum != null) {
          const projectedExcess = Math.max(0, projected - maximum);
          const currentExcess = Math.max(0, current - maximum);
          const scale = Math.max(1, Math.abs(maximum));
          policyLimitViolation += (projectedExcess / scale) ** 2;
          policyMaximumWorsening += (Math.max(0, projectedExcess - currentExcess) / scale) ** 2;
        }
      }
      const categoryCount = configuredCategories.length;
      maximumWorsening += importance * policyMaximumWorsening / categoryCount;
      limitViolation += importance * policyLimitViolation / categoryCount;
      targetDeviation += importance * policyTargetDeviation / categoryCount;
    }
    return { maximumWorsening, limitViolation, targetDeviation, investedFraction };
  }
  return { activePolicies: policies.length, evaluate };
}
const strategyScoreKeys = ["maximumWorsening", "limitViolation", "targetDeviation", "investedFraction"];
function compareStrategyScores(left, right) {
  for (const key of strategyScoreKeys) {
    const scale = Math.max(1, Math.abs(left[key]), Math.abs(right[key]));
    const tolerance = scale * 1e-10;
    if (left[key] < right[key] - tolerance) return -1;
    if (left[key] > right[key] + tolerance) return 1;
  }
  return 0;
}
function optimizeInvestmentCashAllocation(candidates, routing, evaluator) {
  const investmentCash = routing.investmentCashAccount;
  const availableCash = Math.max(0, Number(routing.projectedValues[investmentCash.id]) || 0);
  const destinations = [
    investmentCash,
    ...[...candidates].sort((left, right) => `${left.id}\0${left.name}`.localeCompare(`${right.id}\0${right.name}`))
  ];
  const baseValues = { ...routing.projectedValues };
  baseValues[investmentCash.id] = 0;
  const allocations = destinations.map((_, index) => index === 0 ? availableCash : 0);
  function projectedValues(nextAllocations) {
    const values = { ...baseValues };
    for (let index = 0; index < destinations.length; index += 1) {
      const destination = destinations[index];
      values[destination.id] = (values[destination.id] || 0) + nextAllocations[index];
    }
    return values;
  }
  function allocationScore(nextAllocations) {
    const invested = Math.max(0, availableCash - nextAllocations[0]);
    return evaluator.evaluate(projectedValues(nextAllocations), availableCash > 0 ? invested / availableCash : 0);
  }
  let score = allocationScore(allocations);
  const amountPrecision = Math.max(5e-3, availableCash * 1e-8);
  const goldenRatio = (Math.sqrt(5) - 1) / 2;
  for (let sweep = 0; sweep < 16; sweep += 1) {
    let largestChange = 0;
    for (let leftIndex = 0; leftIndex < destinations.length - 1; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < destinations.length; rightIndex += 1) {
        let evaluateSplit = function(leftAmount) {
          const trial = [...allocations];
          trial[leftIndex] = Math.max(0, Math.min(pairTotal, leftAmount));
          trial[rightIndex] = pairTotal - trial[leftIndex];
          const trialScore = allocationScore(trial);
          if (compareStrategyScores(trialScore, bestScore) < 0) {
            bestLeft = trial[leftIndex];
            bestScore = trialScore;
          }
          return trialScore;
        };
        const pairTotal = allocations[leftIndex] + allocations[rightIndex];
        if (pairTotal <= amountPrecision) continue;
        const currentLeft = allocations[leftIndex];
        let bestLeft = currentLeft;
        let bestScore = score;
        evaluateSplit(0);
        evaluateSplit(pairTotal);
        let low = 0;
        let high = pairTotal;
        let first = high - goldenRatio * (high - low);
        let second = low + goldenRatio * (high - low);
        let firstScore = evaluateSplit(first);
        let secondScore = evaluateSplit(second);
        for (let iteration = 0; iteration < 32 && high - low > amountPrecision; iteration += 1) {
          if (compareStrategyScores(firstScore, secondScore) <= 0) {
            high = second;
            second = first;
            secondScore = firstScore;
            first = high - goldenRatio * (high - low);
            firstScore = evaluateSplit(first);
          } else {
            low = first;
            first = second;
            firstScore = secondScore;
            second = low + goldenRatio * (high - low);
            secondScore = evaluateSplit(second);
          }
        }
        evaluateSplit((low + high) / 2);
        if (Math.abs(bestLeft - currentLeft) <= amountPrecision || compareStrategyScores(bestScore, score) >= 0) continue;
        allocations[leftIndex] = bestLeft;
        allocations[rightIndex] = pairTotal - bestLeft;
        largestChange = Math.max(largestChange, Math.abs(bestLeft - currentLeft));
        score = bestScore;
      }
    }
    if (largestChange <= amountPrecision) break;
  }
  return {
    allocations,
    destinations,
    projectedValues: projectedValues(allocations)
  };
}
function unresolvedStrategyRules(assets, strategy, assetTypes, dimensions, valueOverrides) {
  const unresolved = [];
  for (const [key, policy] of Object.entries(strategy?.dimensionPolicies || {})) {
    if (policy.mode !== "target" && policy.mode !== "limits") continue;
    const categories = policy.categories || {};
    for (const row of concentrationRows(assets, key, policy, assetTypes, dimensions, valueOverrides, "financial")) {
      const config = categories[row.category] || {};
      const configured = policy.mode === "target" ? configuredPercentage(config.target) != null : configuredPercentage(config.min) != null || configuredPercentage(config.max) != null;
      if (!configured || row.status === "On track") continue;
      unresolved.push({
        key,
        category: row.category,
        label: row.label,
        status: row.status,
        current: row.current,
        target: row.target,
        min: row.min,
        max: row.max
      });
    }
  }
  return unresolved;
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
        amount
      });
    }
    source.remaining -= amount;
    destination.remaining -= amount;
    if (source.remaining <= 1e-9) sourceIndex += 1;
    if (destination.remaining <= 1e-9) destinationIndex += 1;
  }
  return flows;
}
function planCashTransfers(assets, strategy) {
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
    reserve: asset.reserveToKeep === "" || asset.reserveToKeep == null ? automaticReserve : Math.max(0, Number(asset.reserveToKeep) || 0),
    assignment: asset.reserveToKeep === "" || asset.reserveToKeep == null ? "Equal share" : "Specified"
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
  const checkingSources = () => checkingAccounts.map((asset) => ({ asset, amount: Math.max(0, (projectedValues[asset.id] || 0) - (reserveById.get(asset.id) || 0)) })).filter((item) => item.amount > 0.01);
  const checkingDeficits = () => checkingAccounts.map((asset) => ({ asset, amount: Math.max(0, (reserveById.get(asset.id) || 0) - (projectedValues[asset.id] || 0)) })).filter((item) => item.amount > 0.01);
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
  const surplus = reserveShortfall <= 0.01 ? Math.max(0, checkingCashAfterReplenishment - effectiveReserveTarget) : 0;
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
    projected: projectedValues[account.assetId] || 0
  }));
  let reason;
  if (!checkingAccounts.length) {
    reason = "No checking accounts are configured for the cash reserve.";
  } else if (reserveShortfall > 0.01) {
    reason = investmentCashAccount ? "Checking-account reserves remain underfunded after using the available investment cash." : "Checking-account reserves are underfunded; choose an investment cash destination to replenish them.";
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
    reason
  };
}
function recommendSurplusCash(assets, strategy, assetTypes = {}, dimensions = {}) {
  const activeAssets = assets || [];
  const routing = planCashTransfers(activeAssets, strategy);
  const candidates = activeAssets.filter((asset) => asset.portfolioScope === "financial" && asset.eligibleForInvestment && !asset.isCheckingAccount && !asset.isInvestmentCashAccount);
  const initialValues = Object.fromEntries(activeAssets.map((asset) => [asset.id, assetValue(asset)]));
  const availableToInvest = routing.reserveShortfall <= 0.01 && routing.investmentCashAccount ? Math.max(0, Number(routing.projectedValues[routing.investmentCashAccount.id]) || 0) : 0;
  const result = {
    ...routing,
    plan: [],
    currentValues: initialValues,
    projectedValues: { ...routing.projectedValues },
    currentMetrics: portfolioMetrics(activeAssets, [], initialValues),
    projectedMetrics: portfolioMetrics(activeAssets, [], routing.projectedValues),
    availableToInvest,
    unallocated: 0,
    unresolvedRules: [],
    reason: ""
  };
  if (routing.reserveShortfall > 0.01) {
    result.reason = routing.reason;
    return result;
  }
  if (routing.surplus > 0.01 && !routing.investmentCashAccount) {
    result.reason = routing.reason;
    return result;
  }
  if (availableToInvest <= 0.01) {
    result.reason = routing.reason;
    return result;
  }
  if (!candidates.length) {
    result.reason = "No assets are marked as eligible for additional investment.";
    result.unallocated = availableToInvest;
    result.unresolvedRules = unresolvedStrategyRules(activeAssets, strategy, assetTypes, dimensions, result.projectedValues);
    return result;
  }
  const evaluator = createStrategyEvaluator(activeAssets, strategy, assetTypes, dimensions, initialValues);
  if (!evaluator.activePolicies) {
    result.reason = "Configure at least one target allocation or limit to generate an investment plan.";
    result.unallocated = availableToInvest;
    return result;
  }
  const optimized = optimizeInvestmentCashAllocation(candidates, routing, evaluator);
  result.projectedValues = optimized.projectedValues;
  result.plan = optimized.destinations.slice(1).map((asset, index) => ({ assetId: asset.id, name: asset.name, amount: optimized.allocations[index + 1] })).filter((item) => item.amount > 5e-3).sort((left, right) => right.amount - left.amount || left.name.localeCompare(right.name) || left.assetId.localeCompare(right.assetId));
  result.unallocated = Math.max(0, optimized.allocations[0]);
  result.projectedMetrics = portfolioMetrics(activeAssets, [], result.projectedValues);
  result.unresolvedRules = unresolvedStrategyRules(activeAssets, strategy, assetTypes, dimensions, result.projectedValues);
  result.reason = result.plan.length ? result.unallocated > 0.01 ? "The recommendation improves the highest-priority strategy rules and retains the remainder when further purchases would not improve them." : "The available investment cash is distributed to minimize configured strategy violations across all active dimensions." : "The available cash remains in the investment cash account because no eligible purchase improves the configured strategy.";
  return result;
}
function groupByPeriod(points, mode) {
  const format = (date) => mode === "monthly" ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : `${date.getFullYear()}`;
  const map = /* @__PURE__ */ new Map();
  for (const point of points || []) {
    const key = format(point.date);
    const previous = map.get(key);
    const { date, ...rest } = point;
    if (!previous || point.date.getTime() > previous.lastDate) map.set(key, { label: key, lastDate: point.date.getTime(), ...rest });
  }
  return Array.from(map.values()).sort((a, b) => a.lastDate - b.lastDate);
}
function buildSeries(snapshots, period, portfolioView = "total", assetTypes = {}) {
  const points = (snapshots || []).map((snapshot) => {
    const metrics = portfolioMetrics(snapshot.assets || [], snapshot.liabilities || []);
    const value = portfolioView === "total" ? metrics.totalNetWorth : portfolioView === "investable" ? metrics.investableAssets : metrics.financialPortfolio;
    return {
      date: new Date(snapshot.asOf),
      value,
      ...currentByDimension(snapshot.assets || [], "asset_type", assetTypes, {}, portfolioView)
    };
  });
  return groupByPeriod(points, period).map(({ lastDate: _lastDate, ...rest }) => rest);
}
function buildPortfolioComparisonSeries(snapshots, period) {
  const points = (snapshots || []).map((snapshot) => {
    const metrics = portfolioMetrics(snapshot.assets || [], snapshot.liabilities || []);
    return {
      date: new Date(snapshot.asOf),
      totalAssets: metrics.totalAssets,
      investableAssets: metrics.investableAssets,
      financialPortfolio: metrics.financialPortfolio
    };
  });
  return groupByPeriod(points, period).map(({ lastDate: _lastDate, ...rest }) => rest);
}
function mkId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
const standardCategoryColors = {
  cash: "#34a853",
  real_estate: "#f28b82",
  stock: "#8ab4f8",
  private_equity: "#a142f4",
  bond: "#fbbc04",
  commodity: "#ff6d01"
};
function colorForCategory(key) {
  const normalizedKey = String(key || "");
  if (standardCategoryColors[normalizedKey]) return standardCategoryColors[normalizedKey];
  let hash = 2166136261;
  for (let index = 0; index < normalizedKey.length; index++) {
    hash ^= normalizedKey.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `hsl(${(hash >>> 0) % 360} 68% 58%)`;
}
function labelFor(key, registry = {}) {
  return registry[key]?.name || key;
}
function mkAsset(type, registry, name = "") {
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
    value: 0
  };
}
function formatCurrency(n, currency = "EUR") {
  try {
    return new Intl.NumberFormat(void 0, {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(n);
  } catch {
    return `${Math.round(Number(n) || 0).toLocaleString()} ${currency}`;
  }
}
function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = "",
  inputClassName = "",
  disabled = false,
  autoFocus = false,
  onKeyDown,
  onBlur,
  error = "",
  required = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block text-sm ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-400", children: [
      label,
      required ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: " *" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        value,
        placeholder,
        onChange: (e) => onChange(e.target.value),
        disabled,
        autoFocus,
        onKeyDown,
        onBlur,
        required,
        className: `mt-1 rounded-lg bg-zinc-900 border px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 ${error ? "border-red-700 focus:ring-red-600" : "border-zinc-800 focus:ring-blue-500"} ${inputClassName || "w-full"}`
      }
    ),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-red-400", children: error })
  ] });
}
const commonCurrencies = ["EUR", "USD", "GBP", "CHF", "CZK", "PLN", "HUF", "JPY", "CAD", "AUD"];
function normalizeCurrencyCode(value) {
  return String(value || "").trim().toUpperCase();
}
function currencyError(value) {
  const code = normalizeCurrencyCode(value);
  if (!/^[A-Z]{3}$/.test(code)) return "Enter a three-letter currency code.";
  try {
    new Intl.NumberFormat(void 0, { style: "currency", currency: code }).format(1);
    return "";
  } catch {
    return "This currency code is not supported by your browser.";
  }
}
function CurrencySelect({ label = "Currency", value, onChange, referencedCurrencies = [], disabled = false }) {
  const normalized = normalizeCurrencyCode(value);
  const options = reactExports.useMemo(() => Array.from(/* @__PURE__ */ new Set([
    ...commonCurrencies,
    ...referencedCurrencies.map(normalizeCurrencyCode).filter((code) => /^[A-Z]{3}$/.test(code))
  ])), [referencedCurrencies.join("|")]);
  const isOther = !!normalized && !options.includes(normalized);
  const [customOpen, setCustomOpen] = reactExports.useState(isOther || !normalized);
  const [customCode, setCustomCode] = reactExports.useState(isOther ? normalized : "");
  const error = customOpen ? currencyError(customCode) : "";
  reactExports.useEffect(() => {
    if (isOther) {
      setCustomOpen(true);
      setCustomCode(normalized);
    }
  }, [isOther, normalized]);
  function select(next) {
    if (next === "__other") {
      setCustomOpen(true);
      if (options.includes(normalized)) setCustomCode("");
      return;
    }
    setCustomOpen(false);
    onChange(next);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-400", children: [
        label,
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: " *" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: customOpen ? "__other" : normalized,
          onChange: (event) => select(event.target.value),
          disabled,
          className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60",
          children: [
            options.map((code) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: code, children: code }, code)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "__other", children: "Other…" })
          ]
        }
      )
    ] }),
    customOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      TextInput,
      {
        label: "Custom currency code",
        value: customCode,
        onChange: (next) => {
          const code = normalizeCurrencyCode(next);
          setCustomCode(code);
          if (!currencyError(code)) onChange(code);
        },
        placeholder: "e.g. SEK",
        error,
        disabled,
        required: true,
        inputClassName: "w-40 uppercase"
      }
    )
  ] });
}
function separators(locale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    group: parts.find((part) => part.type === "group")?.value || ",",
    decimal: parts.find((part) => part.type === "decimal")?.value || "."
  };
}
function parseNumericInput(input, locale) {
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  const original = String(input ?? "").trim();
  if (!original) return null;
  const { decimal } = separators(locale);
  let normalized = original.replace(/[\s\u00a0\u202f']/g, "").replace(/[€$£¥%]/g, "");
  const comma = normalized.lastIndexOf(",");
  const dot = normalized.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    const decimalCharacter = comma > dot ? "," : ".";
    const groupingCharacter = decimalCharacter === "," ? "." : ",";
    normalized = normalized.split(groupingCharacter).join("").replace(decimalCharacter, ".");
  } else if (comma >= 0) {
    const parts = normalized.split(",");
    const looksGrouped = parts.length > 1 && parts.slice(1).every((part) => part.length === 3) && decimal !== ",";
    normalized = looksGrouped ? parts.join("") : `${parts.slice(0, -1).join("")}.${parts.at(-1)}`;
  } else if ((normalized.match(/\./g) || []).length > 1) {
    const parts = normalized.split(".");
    normalized = parts.slice(0, -1).join("") + "." + parts.at(-1);
  }
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}
function validateNumericValue(value, { min, max, required = true, label = "Value" } = {}) {
  if (value == null) return required ? `${label} is required.` : "";
  if (!Number.isFinite(value)) return `${label} must be a valid number.`;
  if (min != null && value < min) return `${label} must be at least ${min}.`;
  if (max != null && value > max) return `${label} must be no more than ${max}.`;
  return "";
}
function numericDraftResult(draft, options = {}) {
  const parsed = parseNumericInput(draft, options.locale);
  const error = validateNumericValue(parsed, options);
  if (error) return { value: null, error };
  if (parsed == null) return { value: "", error: "" };
  return { value: options.precision == null ? parsed : Number(parsed.toFixed(options.precision)), error: "" };
}
function formatNumericValue(value, { kind = "number", currency = "EUR", precision, locale } = {}) {
  if (value === "" || value == null) return "";
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return "";
  const defaults = { money: 2, percent: 2, quantity: 6, fx: 6, year: 0, number: 2 };
  const digits = precision ?? defaults[kind] ?? 2;
  const options = {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
    useGrouping: kind !== "year"
  };
  if (kind === "money") {
    options.style = "currency";
    options.currency = currency;
  }
  try {
    const formatted = new Intl.NumberFormat(locale, options).format(number);
    return kind === "percent" ? `${formatted}%` : formatted;
  } catch {
    const formatted = number.toLocaleString(locale, { maximumFractionDigits: digits });
    return kind === "money" ? `${formatted} ${currency}` : kind === "percent" ? `${formatted}%` : formatted;
  }
}
function rawValue(value) {
  return value === "" || value == null ? "" : String(value);
}
function NumberInput({
  label,
  value,
  onChange,
  kind = "number",
  currency = "EUR",
  min,
  max,
  precision,
  required = true,
  disabled = false,
  autoFocus = false,
  className = "",
  inputClassName = "",
  externalError = "",
  warning = "",
  onValidityChange,
  onEditingChange,
  onCommit,
  placeholder = ""
}) {
  const [editing, setEditing] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(() => rawValue(value));
  const [internalError, setInternalError] = reactExports.useState("");
  const skipNextBlur = reactExports.useRef(false);
  const error = externalError || internalError;
  reactExports.useEffect(() => {
    if (!editing) setDraft(rawValue(value));
  }, [value, editing]);
  reactExports.useEffect(() => {
    onValidityChange?.(!error);
  }, [error, onValidityChange]);
  const display = reactExports.useMemo(() => formatNumericValue(value, { kind, currency, precision }), [value, kind, currency, precision]);
  function finish({ cancel = false, element } = {}) {
    if (cancel) {
      setDraft(rawValue(value));
      setInternalError("");
      setEditing(false);
      onEditingChange?.(false);
      element?.setCustomValidity("");
      return true;
    }
    const result = numericDraftResult(draft, { min, max, required, label, precision });
    const nextError = result.error;
    setInternalError(nextError);
    element?.setCustomValidity(nextError);
    if (nextError) return false;
    const next = result.value;
    onChange(next);
    onCommit?.(next);
    setDraft(rawValue(next));
    setEditing(false);
    onEditingChange?.(false);
    return true;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `block text-sm ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-400", children: [
      label,
      required ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: " *" }) : null
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "text",
        inputMode: kind === "year" ? "numeric" : "decimal",
        value: editing ? draft : display,
        placeholder,
        disabled,
        autoFocus,
        onFocus: (event) => {
          setEditing(true);
          setDraft(rawValue(value));
          setInternalError("");
          onEditingChange?.(true);
          if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(() => event.target.select());
          else event.target.select();
        },
        onChange: (event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);
          const nextError = validateNumericValue(parseNumericInput(nextDraft), { min, max, required, label });
          event.currentTarget.setCustomValidity(nextError);
          setInternalError(nextError);
        },
        onBlur: (event) => {
          if (skipNextBlur.current) {
            skipNextBlur.current = false;
            return;
          }
          finish({ element: event.currentTarget });
        },
        onKeyDown: (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (finish({ element: event.currentTarget })) {
              skipNextBlur.current = true;
              event.currentTarget.blur();
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            skipNextBlur.current = true;
            finish({ cancel: true, element: event.currentTarget });
            event.currentTarget.blur();
          }
        },
        onWheel: (event) => event.currentTarget.blur(),
        className: `mt-1 w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 ${error ? "border-red-700 focus:ring-red-600" : editing ? "border-blue-600 focus:ring-blue-500" : "border-zinc-800 focus:ring-blue-500"} disabled:cursor-not-allowed disabled:opacity-60 ${inputClassName}`,
        "data-invalid": error ? "true" : void 0
      }
    ),
    error ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-red-400", children: error }) : warning ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-amber-400", children: warning }) : null
  ] });
}
function MoneyInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { kind: "money", min: 0, precision: 2, ...props });
}
function PercentageInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { kind: "percent", min: 0, max: 100, precision: 2, ...props });
}
function QuantityInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { kind: "quantity", min: 0, precision: 6, ...props });
}
function FxRateInput(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { kind: "fx", min: 1e-6, precision: 6, ...props });
}
function DimensionExposureEditor({ definition, value = {}, rule, onChange }) {
  const locked = rule?.mode === "locked";
  const entries = Object.entries(value || {});
  const options = Object.entries(definition?.values || {});
  const total = entries.reduce((sum, [, percentage]) => sum + (Number(percentage) || 0), 0);
  const [editingSplit, setEditingSplit] = reactExports.useState(false);
  if (rule?.mode === "na") return null;
  const categoryName = (category) => definition?.values?.[category]?.name || category;
  const positiveEntries = entries.filter(([, percentage]) => Number(percentage) > 0);
  const singleCategory = entries.length === 1 ? entries[0][0] : "";
  function chooseSingleCategory(category) {
    onChange(category ? { [category]: 100 } : {});
  }
  function updateCategory(previous, next) {
    if (!next || previous === next) return;
    const copy = { ...value };
    const percentage = copy[previous] ?? 100;
    delete copy[previous];
    copy[next] = percentage;
    onChange(copy);
  }
  function updatePercentage(category, percentage) {
    onChange({ ...value, [category]: percentage });
  }
  function addExposure() {
    const available = options.find(([key]) => !Object.prototype.hasOwnProperty.call(value, key));
    if (!available) return;
    onChange({ ...value, [available[0]]: entries.length ? 0 : 100 });
  }
  function removeExposure(category) {
    const copy = { ...value };
    delete copy[category];
    onChange(copy);
  }
  function finishSplit() {
    const positive = Object.fromEntries(positiveEntries);
    if (positiveEntries.length === 1) {
      onChange({ [positiveEntries[0][0]]: 100 });
    } else if (positiveEntries.length !== entries.length) {
      onChange(positive);
    }
    setEditingSplit(false);
  }
  if (locked) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-9 items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: positiveEntries.length ? positiveEntries.map(([category]) => categoryName(category)).join(" · ") : "Unclassified" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 text-xs text-zinc-500", children: "Fixed by asset type" })
    ] });
  }
  if (!editingSplit && entries.length <= 1) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "min-w-40 flex-1 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "sr-only", children: [
          definition.name,
          " category"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: singleCategory,
            "aria-label": `${definition.name} category`,
            onChange: (event) => chooseSingleCategory(event.target.value),
            className: "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-zinc-100",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Choose category…" }),
              options.map(([key, option]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: option.name }, key))
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => setEditingSplit(true),
          "aria-label": `Split ${definition.name} allocation`,
          disabled: !options.length,
          className: "h-9 rounded-lg border border-zinc-700 bg-zinc-800 px-2 text-xs hover:bg-zinc-700 disabled:opacity-30",
          children: "Split allocation"
        }
      )
    ] });
  }
  if (!editingSplit) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-9 flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-2 py-1.5 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: positiveEntries.map(([category, percentage]) => `${categoryName(category)} ${percentage}%`).join(" · ") || "Unclassified" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setEditingSplit(true), "aria-label": `Edit ${definition.name} split`, className: "shrink-0 text-sm text-blue-400 hover:text-blue-300", children: "Edit split" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-lg border border-zinc-700 bg-zinc-950/40 p-3", children: [
    entries.map(([category, percentage]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_7rem_2.5rem] items-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: category,
            "aria-label": `${definition.name} category`,
            disabled: locked,
            onChange: (event) => updateCategory(category, event.target.value),
            className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-zinc-100 disabled:opacity-60",
            children: options.map(([key, option]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: option.name }, key))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        PercentageInput,
        {
          label: "Exposure %",
          value: String(percentage),
          onChange: (next) => updatePercentage(category, next),
          disabled: locked
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          title: "Delete exposure",
          "aria-label": `Delete ${definition.name} exposure`,
          disabled: locked,
          onClick: () => removeExposure(category),
          className: "h-10 w-10 rounded-lg border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-950/60 disabled:opacity-30",
          children: "🗑️"
        }
      )
    ] }, category)),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            title: "Add exposure",
            "aria-label": `Add ${definition.name} exposure`,
            onClick: addExposure,
            disabled: entries.length >= options.length,
            className: "h-8 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-30 text-sm",
            children: "➕"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: finishSplit, className: "h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm hover:bg-zinc-700", children: positiveEntries.length <= 1 ? "Use single category" : "Done" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${entries.length && Math.abs(total - 100) < 0.01 ? "text-emerald-400" : "text-amber-400"}`, children: entries.length ? `Total ${total}%` : "Unclassified" })
    ] })
  ] });
}
const modalStack = [];
function Modal({
  open,
  title,
  description,
  onClose,
  dirty = false,
  onSubmit,
  children,
  deleteAction,
  primaryAction,
  secondaryLabel = "Cancel",
  size = "max-w-3xl",
  contentClassName = "p-5",
  zIndex = "z-50"
}) {
  const titleId = reactExports.useId();
  const stackId = reactExports.useRef(Symbol("modal"));
  const [confirmDiscard, setConfirmDiscard] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!open) return void 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalStack.push(stackId.current);
    return () => {
      const index = modalStack.lastIndexOf(stackId.current);
      if (index >= 0) modalStack.splice(index, 1);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  reactExports.useEffect(() => {
    if (!open) return void 0;
    function keydown(event) {
      if (event.key !== "Escape" || modalStack.at(-1) !== stackId.current) return;
      event.preventDefault();
      if (confirmDiscard) setConfirmDiscard(false);
      else if (dirty) setConfirmDiscard(true);
      else onClose?.();
    }
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [open, dirty, confirmDiscard, onClose]);
  reactExports.useEffect(() => {
    if (!open) setConfirmDiscard(false);
  }, [open]);
  if (!open) return null;
  const Container = onSubmit ? "form" : "div";
  const requestClose = () => dirty ? setConfirmDiscard(true) : onClose?.();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `fixed inset-0 ${zIndex} flex items-center justify-center bg-black/65 p-6`, onMouseDown: (event) => {
    if (event.target === event.currentTarget) requestClose();
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Container,
      {
        onSubmit,
        className: `flex max-h-[calc(100vh-3rem)] w-full ${size} flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl`,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": titleId,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "shrink-0 border-b border-zinc-800 bg-zinc-900 px-5 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { id: titleId, className: "text-lg font-medium text-zinc-100", children: title }),
            description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-500", children: description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `min-h-0 flex-1 overflow-y-auto ${contentClassName}`, children }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "flex shrink-0 items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-900 px-5 py-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: deleteAction }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: requestClose, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700", children: secondaryLabel }),
              primaryAction
            ] })
          ] })
        ]
      }
    ),
    confirmDiscard && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 z-[70] flex items-center justify-center bg-black/70 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-5 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: "Discard unsaved changes?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-zinc-400", children: "Changes made in this dialog have not been applied." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setConfirmDiscard(false), className: "rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700", children: "Keep editing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
          setConfirmDiscard(false);
          onClose?.();
        }, className: "rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600", children: "Discard changes" })
      ] })
    ] }) })
  ] });
}
function initialAsset(asset, assetTypes, currency) {
  if (asset) return normalizeAsset(asset, assetTypes);
  const type = Object.keys(assetTypes)[0] || "cash";
  const base = mkAsset(type, assetTypes);
  base.pricingCurrency = currency;
  const next = applyAssetTypeRules(normalizeAsset(base, assetTypes), assetTypes, true);
  next.name = "";
  return next;
}
function ruleLabel(mode) {
  return {
    locked: "Fixed by asset type",
    default: "Asset-type default",
    user: "Choose for this asset",
    na: "Not used for this asset type"
  }[mode] || "Choose for this asset";
}
function concentrationSummary(assetDimensions, dimensions, rules) {
  const applicable = Object.entries(dimensions).filter(([key]) => key !== "ownership" && rules[key]?.mode !== "na");
  if (!applicable.length) return "No applicable dimensions";
  let classified = 0;
  let split = 0;
  for (const [key] of applicable) {
    const entries = Object.entries(assetDimensions?.[key] || {}).filter(([, percentage]) => Number(percentage) > 0);
    if (entries.length) classified += 1;
    if (entries.length > 1) split += 1;
  }
  return `${classified}/${applicable.length} classified${split ? ` · ${split} split` : ""}`;
}
function AssetFormModal({
  open,
  asset,
  onClose,
  assetTypes,
  assets = [],
  dimensions,
  currency = "EUR",
  referencedCurrencies = [],
  onSave,
  onDelete
}) {
  const [draft, setDraft] = reactExports.useState(() => initialAsset(asset, assetTypes, currency));
  const [original, setOriginal] = reactExports.useState(() => initialAsset(asset, assetTypes, currency));
  reactExports.useEffect(() => {
    if (!open) return;
    const next = initialAsset(asset, assetTypes, currency);
    setDraft(next);
    setOriginal(next);
  }, [open, asset, assetTypes, currency]);
  const calculatedValue = reactExports.useMemo(() => assetValue(draft), [draft]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  const sameCurrency = draft.pricingCurrency === currency;
  const nameError = draft.name.trim() ? "" : "Asset name is required.";
  const ownershipError = Number(draft.ownershipShare) > 0 && Number(draft.ownershipShare) <= 100 ? "" : "Ownership share must be greater than 0 and no more than 100.";
  const fxError = Number(draft.fxRate) > 0 ? "" : "FX rate must be greater than zero.";
  const valueError = draft.valuationMode === "units" ? Number(draft.quantity) < 0 || Number(draft.unitPrice) < 0 : Number(draft.value) < 0;
  const valid = !nameError && !ownershipError && !fxError && !valueError;
  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  function changeType(type) {
    setDraft((previous) => applyAssetTypeRules(normalizeAsset({
      ...previous,
      type,
      isCheckingAccount: type === "cash",
      reserveToKeep: "",
      isInvestmentCashAccount: false,
      eligibleForInvestment: type !== "cash" && type !== "real_estate"
    }, assetTypes), assetTypes, true));
  }
  function changeScope(portfolioScope) {
    setDraft((previous) => ({
      ...previous,
      portfolioScope,
      scopeNeedsReview: false,
      isCheckingAccount: portfolioScope === "financial" ? false : previous.isCheckingAccount,
      reserveToKeep: portfolioScope === "financial" ? "" : previous.reserveToKeep,
      isInvestmentCashAccount: portfolioScope === "financial" ? previous.isInvestmentCashAccount : false
    }));
  }
  function setCheckingAccount(checked) {
    setDraft((previous) => ({
      ...previous,
      isCheckingAccount: checked,
      portfolioScope: checked ? "investable" : previous.portfolioScope,
      isInvestmentCashAccount: checked ? false : previous.isInvestmentCashAccount
    }));
  }
  function setInvestmentCashAccount(checked) {
    setDraft((previous) => ({
      ...previous,
      isInvestmentCashAccount: checked,
      portfolioScope: checked ? "financial" : previous.portfolioScope,
      isCheckingAccount: checked ? false : previous.isCheckingAccount,
      reserveToKeep: checked ? "" : previous.reserveToKeep,
      eligibleForInvestment: checked ? false : previous.eligibleForInvestment
    }));
  }
  function changeCurrency(pricingCurrency) {
    setDraft((previous) => ({
      ...previous,
      pricingCurrency,
      fxRate: pricingCurrency === currency ? 1 : previous.fxRate
    }));
  }
  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    const normalized = { ...normalizeAsset(draft, assetTypes), scopeNeedsReview: false };
    onSave(normalized);
    onClose();
  }
  if (!open) return null;
  const rules = assetTypes[draft.type]?.dimensionRules || {};
  const scopeRule = assetTypes[draft.type]?.scopeRule || { mode: "user" };
  const currencies = Array.from(new Set([currency, ...referencedCurrencies, draft.pricingCurrency].filter(Boolean)));
  const applicableDimensions = Object.entries(dimensions).filter(([key]) => key !== "ownership" && rules[key]?.mode !== "na");
  const otherInvestmentCashAccount = assets.find((item) => item.id !== draft.id && item.isInvestmentCashAccount);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title: asset ? "Edit asset" : "Add asset",
      description: `Current portfolio value: ${formatCurrency(calculatedValue, currency)}`,
      onClose,
      dirty,
      onSubmit: submit,
      size: "max-w-7xl",
      contentClassName: "p-3",
      deleteAction: asset && onDelete ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onDelete(asset), className: "rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600", children: "🗑️ Delete asset" }) : null,
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !valid, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: asset ? "Save asset" : "Add asset" }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        draft.scopeNeedsReview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-amber-700 bg-amber-950/30 p-3 text-sm text-amber-200", children: "Review this asset’s portfolio scope. It could not be classified safely during the file upgrade; saving confirms your selection." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 lg:grid-cols-[minmax(0,0.95fr)_minmax(32rem,1.05fr)] lg:items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-zinc-800 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Basics" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Identity and ownership." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, required: true, label: "Asset name", placeholder: assetTypes[draft.type]?.name || "Asset name", value: draft.name, onChange: (value) => set("name", value), error: nameError }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Asset type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: draft.type, onChange: (event) => changeType(event.target.value), className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100", children: Object.entries(assetTypes).map(([key, definition]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: definition.name }, key)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Description", value: draft.description, onChange: (value) => set("description", value) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Ownership" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: draft.ownership, onChange: (event) => set("ownership", event.target.value), className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100", children: Object.entries(dimensions.ownership?.values || {}).map(([key, definition]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: definition.name }, key)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(PercentageInput, { label: "Ownership share %", min: 0.01, value: draft.ownershipShare, onChange: (value) => set("ownershipShare", value), externalError: ownershipError })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-zinc-800 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Valuation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Direct value or units × price." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: draft.valuationMode, onChange: (event) => set("valuationMode", event.target.value), className: "rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1.5 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "total", children: "Direct total value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "units", children: "Quantity × unit price" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `grid grid-cols-1 gap-2 sm:grid-cols-2 ${draft.valuationMode === "units" ? "xl:grid-cols-4" : "xl:grid-cols-3"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencySelect, { label: "Pricing currency", value: draft.pricingCurrency, onChange: changeCurrency, referencedCurrencies: currencies }),
                draft.valuationMode === "units" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(QuantityInput, { label: "Quantity", value: draft.quantity, onChange: (value) => set("quantity", value) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MoneyInput, { label: `Unit price (${draft.pricingCurrency})`, currency: draft.pricingCurrency, value: draft.unitPrice, onChange: (value) => set("unitPrice", value) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MoneyInput, { label: `Current value (${draft.pricingCurrency})`, currency: draft.pricingCurrency, value: draft.value, onChange: (value) => set("value", value) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FxRateInput,
                  {
                    label: `FX rate to ${currency}`,
                    value: draft.fxRate,
                    onChange: (value) => set("fxRate", value),
                    disabled: sameCurrency,
                    externalError: fxError,
                    warning: !sameCurrency && Number(draft.fxRate) === 1 ? "Confirm that 1 is the intended FX rate." : ""
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-zinc-800 p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Portfolio classification" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Scope and recommendation role." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-500", children: portfolioScopeOptions[draft.portfolioScope]?.name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 sm:items-start", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-between gap-2 text-zinc-400", children: [
                    "Portfolio scope",
                    scopeRule.mode === "locked" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-500", children: "Fixed by type" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: draft.portfolioScope, onChange: (event) => changeScope(event.target.value), disabled: scopeRule.mode === "locked", className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 disabled:opacity-60", children: Object.entries(portfolioScopeOptions).map(([key, option]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: option.name }, key)) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-zinc-500", children: portfolioScopeOptions[draft.portfolioScope]?.description })
                ] }),
                draft.type === "cash" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "mt-0.5", checked: draft.isCheckingAccount, onChange: (event) => setCheckingAccount(event.target.checked) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block", children: "Cash-reserve checking account" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-zinc-500", children: "Guidance keeps this account funded before investing." })
                    ] })
                  ] }),
                  draft.isCheckingAccount && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    MoneyInput,
                    {
                      label: `Reserve to keep (${currency})`,
                      value: draft.reserveToKeep,
                      onChange: (value) => set("reserveToKeep", value),
                      currency,
                      required: false,
                      placeholder: "Equal share of remaining reserve"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "mt-0.5", checked: draft.isInvestmentCashAccount, onChange: (event) => setInvestmentCashAccount(event.target.checked) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block", children: "Investment cash destination" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-zinc-500", children: "Receives checking-account surplus and funds the next investment." }),
                      draft.isInvestmentCashAccount && otherInvestmentCashAccount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block text-xs text-amber-400", children: [
                        "Saving replaces ",
                        otherInvestmentCashAccount.name,
                        " as the destination."
                      ] })
                    ] })
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 rounded-lg border border-zinc-800 p-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", className: "mt-0.5", checked: draft.eligibleForInvestment, onChange: (event) => set("eligibleForInvestment", event.target.checked) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block", children: "Eligible for investment" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-xs text-zinc-500", children: "Guidance may allocate new money here." })
                  ] })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2 rounded-xl border border-zinc-800 p-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Concentration details" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Choose one category at 100%; split only diversified assets." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-400", children: concentrationSummary(draft.dimensions, dimensions, rules) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "divide-y divide-zinc-800 rounded-lg border border-zinc-800 px-3", children: [
              applicableDimensions.map(([key, definition]) => {
                const rule = rules[key];
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 py-2 sm:grid-cols-[minmax(8rem,0.65fr)_minmax(0,1.35fr)] sm:items-center sm:gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-zinc-200", children: definition.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs text-zinc-500", children: ruleLabel(rule?.mode) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(DimensionExposureEditor, { definition, rule, value: draft.dimensions?.[key] || {}, onChange: (exposure) => setDraft((previous) => ({ ...previous, dimensions: { ...previous.dimensions, [key]: exposure } })) })
                ] }, key);
              }),
              !applicableDimensions.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-4 text-sm text-zinc-500", children: "No concentration dimensions apply to this asset type." })
            ] })
          ] })
        ] })
      ] })
    }
  );
}
function AddAssetModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AssetFormModal, { ...props, asset: null, onSave: props.onAdd });
}
function AddBtn({ onClick, title, className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      onClick,
      title,
      className: `h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center text-lg ${className}`,
      children: "+"
    }
  );
}
const emptyLiability = { name: "", type: "", description: "", value: 0 };
function LiabilityFormModal({ open, liability, onClose, liabilityTypes, currency = "EUR", onSave, onDelete }) {
  const firstType = Object.keys(liabilityTypes)[0] || "";
  const makeInitial = () => liability ? { ...liability, name: liability.name || "", type: liability.type || firstType, description: liability.description || "", value: Number(liability.value) || 0 } : { ...emptyLiability, type: firstType };
  const [draft, setDraft] = reactExports.useState(makeInitial);
  const [original, setOriginal] = reactExports.useState(makeInitial);
  reactExports.useEffect(() => {
    if (!open) return;
    const next = makeInitial();
    setDraft(next);
    setOriginal(next);
  }, [open, liability, liabilityTypes]);
  function set(key, value) {
    setDraft((previous) => ({ ...previous, [key]: value }));
  }
  const nameError = draft.name.trim() ? "" : "Liability name is required.";
  const valueError = Number(draft.value) >= 0 ? "" : "Liability value cannot be negative.";
  const valid = !!draft.type && !nameError && !valueError;
  const dirty = JSON.stringify(draft) !== JSON.stringify(original);
  function submit(event) {
    event.preventDefault();
    if (!valid) return;
    onSave({ ...draft, name: draft.name.trim(), value: Number(draft.value) });
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title: liability ? "Edit liability" : "Add liability",
      description: "Liabilities are tracked as a simplified current balance.",
      onClose,
      dirty,
      onSubmit: submit,
      size: "max-w-lg",
      deleteAction: liability && onDelete ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onDelete(liability), className: "rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600", children: "🗑️ Delete liability" }) : null,
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !valid, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: liability ? "Save liability" : "Add liability" }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, required: true, label: "Name", value: draft.name, onChange: (value) => set("name", value), error: nameError }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100", value: draft.type, onChange: (event) => set("type", event.target.value), children: Object.entries(liabilityTypes).map(([key, definition]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: definition?.name || key }, key)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-100", rows: "3", value: draft.description, onChange: (event) => set("description", event.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoneyInput, { label: `Current balance (${currency})`, currency, value: draft.value, onChange: (value) => set("value", value), externalError: valueError })
      ] })
    }
  );
}
function AddLiabilityModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiabilityFormModal, { ...props, liability: null, onSave: props.onAdd });
}
function UndoToast({ message, onUndo, onDismiss, duration = 6e3 }) {
  reactExports.useEffect(() => {
    if (!message) return void 0;
    const timer = window.setTimeout(() => onDismiss?.(), duration);
    return () => window.clearTimeout(timer);
  }, [message, onDismiss, duration]);
  if (!message) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-4 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onUndo, className: "font-medium text-blue-400 hover:text-blue-300", children: "Undo" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onDismiss, className: "text-zinc-500 hover:text-zinc-300", children: "Dismiss" })
  ] });
}
function portfolioRole(asset) {
  if (asset.isInvestmentCashAccount) return "Investment cash destination";
  if (asset.isCheckingAccount && asset.portfolioScope !== "total") return "Reserve cash";
  if (asset.portfolioScope === "financial" && asset.eligibleForInvestment) return "Investment destination";
  if (asset.portfolioScope === "financial") return "Managed investment";
  if (asset.portfolioScope === "investable") return "Accessible capital";
  return "Net-worth asset";
}
function currentValueFactor(asset) {
  const fx = asset.fxRate == null ? 1 : Number(asset.fxRate) || 0;
  const ownership = asset.ownershipShare == null ? 1 : Math.max(0, Number(asset.ownershipShare) || 0) / 100;
  const quantity = asset.valuationMode === "units" ? Number(asset.quantity) || 0 : 1;
  return fx * ownership * quantity;
}
function withAssetCurrentValue(asset, currentValue) {
  const factor = currentValueFactor(asset);
  if (factor <= 0) return asset;
  const rawValue2 = (Number(currentValue) || 0) / factor;
  return asset.valuationMode === "units" ? { ...asset, unitPrice: rawValue2 } : { ...asset, value: rawValue2 };
}
function AssetTable({ assets, prevAssets, setAssets, assetTypes, currency = "EUR", readOnly = false, onEdit }) {
  const [sort, setSort] = reactExports.useState({ key: "name", asc: true });
  const [undo, setUndo] = reactExports.useState(null);
  const previousValues = reactExports.useMemo(() => new Map((prevAssets || []).map((asset) => [asset.id, assetValue(asset)])), [prevAssets]);
  function updateCurrentValue(id, value) {
    if (readOnly) return;
    const previous = assets.find((asset) => asset.id === id);
    if (!previous) return;
    const updated = withAssetCurrentValue(previous, value);
    if (updated === previous || assetValue(updated) === assetValue(previous)) return;
    setUndo({ asset: previous, message: `${previous.name}: current value updated.` });
    setAssets?.(assets.map((asset) => asset.id === id ? updated : asset));
  }
  const sortedAssets = reactExports.useMemo(() => {
    const list = [...assets || []];
    list.sort((left, right) => {
      const values = {
        name: [(left.name || "").toLowerCase(), (right.name || "").toLowerCase()],
        type: [assetTypes[left.type]?.name || left.type, assetTypes[right.type]?.name || right.type],
        value: [assetValue(left), assetValue(right)],
        role: [portfolioRole(left), portfolioRole(right)]
      }[sort.key] || [left[sort.key] || "", right[sort.key] || ""];
      const comparison = typeof values[0] === "string" ? values[0].localeCompare(values[1]) : values[0] - values[1];
      return sort.asc ? comparison : -comparison;
    });
    return list;
  }, [assets, assetTypes, sort]);
  function heading(label, key, align = "left") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: `${align === "right" ? "text-right" : "text-left"} cursor-pointer whitespace-nowrap p-2`, onClick: () => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true }), children: [
      label,
      " ",
      sort.key === key ? sort.asc ? "▲" : "▼" : ""
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[680px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        heading("Name", "name"),
        heading("Type", "type"),
        heading("Current value", "value", "right"),
        heading("Portfolio role", "role"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-20 p-2 text-right", children: "Edit" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedAssets.map((asset) => {
        const current = assetValue(asset);
        const hasPrevious = previousValues.has(asset.id);
        const previous = previousValues.get(asset.id) ?? 0;
        const delta = hasPrevious ? current - previous : null;
        const canQuickEdit = currentValueFactor(asset) > 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", onDoubleClick: () => !readOnly && onEdit?.(asset), title: readOnly ? "Historical snapshot" : "Double-click to edit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: asset.name }),
            asset.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: asset.description }),
            asset.scopeNeedsReview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-amber-400", children: "⚠ Review portfolio scope" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: assetTypes[asset.type]?.name || asset.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "whitespace-nowrap p-2 text-right", onDoubleClick: (event) => event.stopPropagation(), title: !readOnly && asset.valuationMode === "units" ? "Editing the current value recalculates the unit price." : void 0, children: [
            readOnly || !canQuickEdit ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: formatCurrency(current, currency) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { label: `${asset.name} current value`, kind: "money", currency, min: 0, precision: 2, value: current, onChange: (value) => updateCurrentValue(asset.id, value), className: "ml-auto w-36 [&>span:first-child]:sr-only", inputClassName: "border-transparent bg-transparent px-1 py-1 text-right hover:border-zinc-700 focus:bg-zinc-800" }),
            delta == null ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", title: "No matching asset in the previous snapshot", children: "—" }) : delta !== 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs ${delta >= 0 ? "text-emerald-400" : "text-red-400"}`, children: [
              delta >= 0 ? "+" : "",
              formatCurrency(delta, currency)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-zinc-300", children: portfolioRole(asset) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: readOnly ? "—" : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onEdit?.(asset), className: "rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700", children: "Edit" }) })
        ] }, asset.id);
      }) })
    ] }),
    !assets?.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6 text-center text-sm text-zinc-500", children: "No assets in this snapshot." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo?.message || "", onUndo: () => {
      if (!undo) return;
      setAssets?.(assets.map((asset) => asset.id === undo.asset.id ? undo.asset : asset));
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
function getChartEntries(data, targetData, showTarget) {
  const labels = Array.from(
    /* @__PURE__ */ new Set([
      ...Object.keys(data || {}),
      ...Object.keys(targetData || {})
    ])
  );
  const source = showTarget ? targetData : data;
  const rawEntries = labels.map((label) => [label, Number(source?.[label]) || 0]);
  const total = rawEntries.reduce((sum, [, value]) => sum + value, 0);
  const entries = total > 0 ? rawEntries.filter(([, value]) => value > 0).map(([label, value]) => ({
    label,
    value,
    color: colorForCategory(label)
  })) : [];
  return { entries, total };
}
function PieChart({ data, targetData, showTarget = false, assetTypes = {}, compact = false, ariaLabel = "" }) {
  const ref = reactExports.useRef(null);
  const arcsRef = reactExports.useRef([]);
  const metricsRef = reactExports.useRef({ cx: 0, cy: 0, radius: 0 });
  const totalRef = reactExports.useRef(1);
  const percentFmtRef = reactExports.useRef(
    new Intl.NumberFormat(void 0, {
      style: "percent",
      maximumFractionDigits: 0
    })
  );
  const [hover, setHover] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    function draw() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      const { entries: entries2, total: total2 } = getChartEntries(data, targetData, showTarget);
      if (total2 <= 0) return;
      totalRef.current = total2;
      let start = -Math.PI / 2;
      const radius = Math.min(width, height) / 2 - 8 * dpr;
      const cx = width / 2;
      const cy = height / 2;
      metricsRef.current = { cx, cy, radius };
      arcsRef.current = [];
      const percentFmt2 = percentFmtRef.current;
      entries2.forEach(({ label, value: val, color }) => {
        const angle = val / total2 * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.fillStyle = color;
        ctx.arc(cx, cy, radius, start, start + angle);
        ctx.closePath();
        ctx.fill();
        if (val > 0) {
          const mid = start + angle / 2;
          const labelRadius = radius * 0.6;
          const percentLabel = percentFmt2.format(val / total2);
          const text = `${percentLabel}`;
          ctx.font = `${12 * dpr}px sans-serif`;
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#fff";
          if (angle > 0.3) {
            const tx = cx + Math.cos(mid) * labelRadius;
            const ty = cy + Math.sin(mid) * labelRadius;
            ctx.textAlign = "center";
            ctx.fillText(text, tx, ty);
          } else {
            const lineStartX = cx + Math.cos(mid) * radius;
            const lineStartY = cy + Math.sin(mid) * radius;
            const lineEndX = cx + Math.cos(mid) * (radius + 16 * dpr);
            const lineEndY = cy + Math.sin(mid) * (radius + 16 * dpr);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath();
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();
            const tx = cx + Math.cos(mid) * (radius + 20 * dpr);
            const ty = cy + Math.sin(mid) * (radius + 20 * dpr);
            ctx.textAlign = mid > Math.PI / 2 || mid < -Math.PI / 2 ? "right" : "left";
            ctx.fillText(text, tx, ty);
          }
        }
        arcsRef.current.push({ start, end: start + angle, label, value: val });
        start += angle;
      });
    }
    function handleMove(e) {
      const canvas2 = ref.current;
      if (!canvas2) return;
      const rect = canvas2.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const { cx, cy, radius } = metricsRef.current;
      const total2 = totalRef.current;
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) {
        setHover(null);
        return;
      }
      let ang = Math.atan2(dy, dx);
      if (ang < -Math.PI / 2) ang += 2 * Math.PI;
      for (const arc of arcsRef.current) {
        if (ang >= arc.start && ang < arc.end) {
          setHover({
            label: arc.label,
            percent: arc.value / total2,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
          return;
        }
      }
      setHover(null);
    }
    function handleLeave() {
      setHover(null);
    }
    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [data, targetData, showTarget]);
  const percentFmt = percentFmtRef.current;
  const { entries, total } = getChartEntries(data, targetData, showTarget);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref,
        role: "img",
        "aria-label": ariaLabel || `${showTarget ? "Target" : "Current"} allocation pie chart`,
        className: `w-full rounded border border-zinc-800 bg-zinc-900 ${compact ? "h-32" : "h-40"}`
      }
    ),
    entries.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { "aria-label": "Chart legend", className: `grid gap-x-4 sm:grid-cols-2 ${compact ? "mt-2 gap-y-1 text-[11px]" : "mt-3 gap-y-1.5 text-xs"}`, children: entries.map(({ label, value, color }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex min-w-0 items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          "aria-hidden": "true",
          className: "h-2.5 w-2.5 shrink-0 rounded-sm",
          style: { backgroundColor: color }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-0 flex-1 truncate", title: assetTypes[label]?.name || label, children: assetTypes[label]?.name || label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "shrink-0 tabular-nums text-zinc-400", children: percentFmt.format(value / total) })
    ] }, label)) }),
    hover && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "absolute pointer-events-none bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs",
        style: { left: hover.x, top: hover.y },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: assetTypes[hover.label]?.name || hover.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: percentFmt.format(hover.percent) })
        ]
      }
    )
  ] });
}
function targetLabel(row, mode) {
  if (mode === "target") return row.target == null ? "—" : `${row.target.toFixed(1)}%`;
  if (mode === "limits") {
    if (row.min != null && row.max != null) return `${row.min}%–${row.max}%`;
    if (row.min != null) return `≥ ${row.min}%`;
    if (row.max != null) return `≤ ${row.max}%`;
  }
  return "—";
}
function ConcentrationPanel({ assets, assetTypes, dimensions, strategy, currency, selectedDimension, onSelectDimension, portfolioView = "total" }) {
  const [sort, setSort] = reactExports.useState({ key: "amount", asc: false });
  const dimensionKeys2 = reactExports.useMemo(() => ["asset_type", ...Object.keys(dimensions)], [dimensions]);
  const chartData = reactExports.useMemo(() => Object.fromEntries(dimensionKeys2.map((key) => [
    key,
    currentByDimension(assets, key, assetTypes, {}, portfolioView)
  ])), [assets, assetTypes, dimensionKeys2, portfolioView]);
  const configuredPolicy = strategy.dimensionPolicies?.[selectedDimension] || { mode: "informational", categories: {} };
  const policy = portfolioView === "financial" ? configuredPolicy : { ...configuredPolicy, mode: "informational" };
  const rows = reactExports.useMemo(() => {
    const result = concentrationRows(assets, selectedDimension, policy, assetTypes, dimensions, {}, portfolioView);
    result.sort((left, right) => {
      const a = left[sort.key];
      const b = right[sort.key];
      const comparison = typeof a === "string" ? a.localeCompare(b) : (a ?? -Infinity) - (b ?? -Infinity);
      return sort.asc ? comparison : -comparison;
    });
    return result;
  }, [assets, selectedDimension, policy, assetTypes, dimensions, portfolioView, sort]);
  function toggleSort(key) {
    setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true });
  }
  function heading(label, key, align = "left") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { onClick: () => toggleSort(key), className: `${align === "right" ? "text-right" : "text-left"} py-2 px-2 cursor-pointer whitespace-nowrap`, children: [
      label,
      " ",
      sort.key === key ? sort.asc ? "▲" : "▼" : ""
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-zinc-200", children: "Concentration overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-zinc-500", children: [
          "All dimensions for ",
          portfolioViews[portfolioView]?.name,
          ". Select a chart to inspect its exact values below."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 md:grid-cols-2 xl:grid-cols-3", children: dimensionKeys2.map((key) => {
        const name = dimensionName(key, dimensions);
        const data = chartData[key] || {};
        const hasData = Object.values(data).some((value) => Number(value) > 0);
        const selected = selectedDimension === key;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "article",
          {
            "data-concentration-chart": key,
            className: `min-w-0 rounded-xl border bg-zinc-950/30 p-3 ${selected ? "border-blue-500 ring-1 ring-blue-500/60" : "border-zinc-800"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  "aria-label": `Show ${name} details`,
                  "aria-pressed": selected,
                  onClick: () => onSelectDimension(key),
                  className: "mb-2 flex w-full items-center justify-between gap-2 rounded text-left focus:outline-none focus:ring-2 focus:ring-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-zinc-200", children: name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] ${selected ? "text-blue-300" : "text-zinc-500"}`, children: selected ? "Selected" : "View details" })
                  ]
                }
              ),
              hasData ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => onSelectDimension(key), className: "cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                PieChart,
                {
                  data,
                  assetTypes: dimensionRegistry(key, assetTypes, dimensions),
                  compact: true,
                  ariaLabel: `${name} concentration pie chart`
                }
              ) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-32 place-items-center rounded border border-dashed border-zinc-800 text-xs text-zinc-500", children: "No assets in this view" })
            ]
          },
          key
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-zinc-800 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-zinc-200", children: "Detailed breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-500", children: "Exact amounts, percentages, and configured strategy comparison." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400 mr-2", children: "Dimension" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "select",
              {
                value: selectedDimension,
                onChange: (event) => onSelectDimension(event.target.value),
                className: "rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2",
                children: dimensionKeys2.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: dimensionName(key, dimensions) }, key))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-zinc-500", children: [
            portfolioViews[portfolioView]?.name,
            " · ",
            portfolioView === "financial" ? `Strategy mode: ${policy.mode || "informational"}` : "Analysis only"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          heading("Category", "label"),
          heading("Amount", "amount", "right"),
          heading("Current", "current", "right"),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-2", children: "Target / limit" }),
          heading("Difference", "difference", "right"),
          heading("Status", "status")
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2", children: row.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right", children: formatCurrency(row.amount, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 px-2 text-right", children: [
            row.current.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-2 text-right", children: targetLabel(row, policy.mode) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 px-2 text-right ${(row.difference || 0) > 0 ? "text-amber-400" : "text-zinc-300"}`, children: row.difference == null ? "—" : `${row.difference > 0 ? "+" : ""}${row.difference.toFixed(1)} pp` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 px-2 ${row.status === "On track" || row.status === "Informational" ? "text-emerald-400" : "text-amber-400"}`, children: row.status })
        ] }, row.category)) })
      ] }) })
    ] })
  ] });
}
function SettingsSectionHeader({ title, description, right }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-zinc-100", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 max-w-3xl text-sm text-zinc-400", children: description })
    ] }),
    right
  ] });
}
function SettingsSummaryCard({ label, value, description, tone = "default" }) {
  const tones = {
    default: "border-zinc-800 bg-zinc-900/70",
    info: "border-blue-900/70 bg-blue-950/20",
    warning: "border-amber-800/70 bg-amber-950/20"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${tones[tone] || tones.default}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-wide text-zinc-500", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-lg font-medium text-zinc-100", children: value }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-400", children: description })
  ] });
}
function SettingsValidation({ children, valid = false }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-lg border px-3 py-2 text-sm ${valid ? "border-emerald-900/70 bg-emerald-950/20 text-emerald-300" : "border-amber-800/70 bg-amber-950/20 text-amber-300"}`, children });
}
function CollapsiblePanel({ title, summary, status, open, onToggle, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: onToggle,
        "aria-expanded": open,
        className: "w-full px-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-medium text-zinc-100", children: title }),
            summary && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 block text-xs text-zinc-500", children: summary })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex shrink-0 items-center gap-2", children: [
            status,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "text-zinc-400", children: open ? "▲" : "▼" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-zinc-800 p-4", children })
  ] });
}
function SettingsEmptyState({ title, description, action }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-dashed border-zinc-700 p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-zinc-300", children: title }),
    description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-zinc-500", children: description }),
    action && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: action })
  ] });
}
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  destructive = true
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title,
      onClose: onCancel,
      size: "max-w-sm",
      zIndex: "z-[60]",
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: onConfirm,
          className: `rounded-lg px-4 py-2 text-sm ${destructive ? "bg-red-700 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-500"}`,
          children: [
            destructive ? "🗑️ " : "",
            confirmLabel
          ]
        }
      ),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-300", children: message || "This action cannot be undone after the confirmation window closes." })
    }
  );
}
function NameDialog({ open, title, label = "Name", initialValue = "", existingNames = [], onClose, onSave }) {
  const [value, setValue] = reactExports.useState(initialValue);
  reactExports.useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);
  const trimmed = value.trim();
  const duplicate = existingNames.some((name) => name.trim().toLowerCase() === trimmed.toLowerCase() && name !== initialValue);
  const error = !trimmed ? `${label} is required.` : duplicate ? `${label} already exists.` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title,
      onClose,
      dirty: value !== initialValue,
      onSubmit: (event) => {
        event.preventDefault();
        if (!error) onSave(trimmed);
      },
      size: "max-w-md",
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !!error, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: "Add" }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label, value, onChange: setValue, error, required: true })
    }
  );
}
const ruleModeLabels = { user: "User selects", default: "Default", locked: "Locked", na: "Not applicable" };
function AssetTypeManager({ assetTypes, setAssetTypes, assets, dimensions, initialSearch = "", initialNewName = "" }) {
  const [selectedKey, setSelectedKey] = reactExports.useState(() => Object.keys(assetTypes)[0] || "");
  const [query, setQuery] = reactExports.useState(initialSearch);
  const [openDimension, setOpenDimension] = reactExports.useState("");
  const [showMobileDetail, setShowMobileDetail] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteKey, setDeleteKey] = reactExports.useState("");
  const [undo, setUndo] = reactExports.useState(null);
  const detailRef = reactExports.useRef(null);
  const selectedButtonRef = reactExports.useRef(null);
  const hasChangedView = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!assetTypes[selectedKey]) setSelectedKey(Object.keys(assetTypes)[0] || "");
  }, [assetTypes, selectedKey]);
  reactExports.useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);
  const usageCounts = reactExports.useMemo(() => {
    const counts = {};
    for (const asset of assets || []) counts[asset.type] = (counts[asset.type] || 0) + 1;
    return counts;
  }, [assets]);
  const filteredTypes = reactExports.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(assetTypes).filter(
      ([key, definition2]) => key === selectedKey || !needle || definition2.name.toLowerCase().includes(needle)
    );
  }, [assetTypes, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(assetTypes).some((definition2) => definition2.name.toLowerCase().includes(query.trim().toLowerCase()));
  function selectType(key) {
    hasChangedView.current = true;
    setSelectedKey(key);
    setOpenDimension("");
    setShowMobileDetail(true);
  }
  function updateName(key, name) {
    setAssetTypes({ ...assetTypes, [key]: { ...assetTypes[key], name } });
  }
  function updateRule(typeKey, dimensionKey, patch) {
    const definition2 = assetTypes[typeKey];
    const current = definition2.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
    let next = { ...current, ...patch };
    if ((next.mode === "locked" || next.mode === "default") && !next.value) next.value = Object.keys(dimensions[dimensionKey]?.values || {})[0] || "";
    setAssetTypes({
      ...assetTypes,
      [typeKey]: { ...definition2, dimensionRules: { ...definition2.dimensionRules, [dimensionKey]: next } }
    });
  }
  function updateScopeRule(typeKey, patch) {
    const definition2 = assetTypes[typeKey];
    const current = definition2.scopeRule || { mode: "user", value: "" };
    let next = { ...current, ...patch };
    if ((next.mode === "locked" || next.mode === "default") && !next.value) next.value = "total";
    setAssetTypes({ ...assetTypes, [typeKey]: { ...definition2, scopeRule: next } });
  }
  function addType(name) {
    const key = mkId();
    hasChangedView.current = true;
    setAssetTypes({ ...assetTypes, [key]: { name, scopeRule: { mode: "user", value: "" }, dimensionRules: {} } });
    setSelectedKey(key);
    setShowMobileDetail(true);
    setAddOpen(false);
  }
  function removeType(key) {
    if (usageCounts[key]) return;
    const copy = { ...assetTypes };
    const removed = copy[key];
    delete copy[key];
    const nextKey = Object.keys(copy)[0] || "";
    hasChangedView.current = true;
    setAssetTypes(copy);
    setSelectedKey(nextKey);
    setShowMobileDetail(false);
    setDeleteKey("");
    setUndo({ key, definition: removed });
  }
  const definition = assetTypes[selectedKey];
  const ruleCounts = { locked: 0, default: 0, user: 0, na: 0 };
  for (const [key] of Object.entries(dimensions).filter(([key2]) => key2 !== "ownership")) {
    const mode = definition?.dimensionRules?.[key]?.mode || "user";
    ruleCounts[mode] = (ruleCounts[mode] || 0) + 1;
  }
  const scopeRule = definition?.scopeRule || { mode: "user", value: "" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSectionHeader, { title: "Asset Types", description: "Configure reusable scope defaults and classification rules without editing every asset individually." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-[34rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-zinc-800 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddOpen(true), title: "Add type", className: "h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "➕" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Search asset types", value: query, onChange: setQuery })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[30rem] overflow-y-auto p-2", children: [
          filteredTypes.map(([key, type]) => {
            const rule = type.scopeRule || { mode: "user", value: "" };
            const scope = rule.value ? portfolioScopeOptions[rule.value]?.name : "User selects";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => selectType(key),
                "aria-current": selectedKey === key ? "true" : void 0,
                ref: selectedKey === key ? selectedButtonRef : void 0,
                className: `mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium", children: type.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`, children: [
                    ruleModeLabels[rule.mode] || "User selects",
                    ": ",
                    scope,
                    " · ",
                    usageCounts[key] || 0,
                    " assets"
                  ] })
                ]
              },
              key
            );
          }),
          !hasQueryMatch && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No other matching asset types", description: "The selected type remains visible while you search.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400 hover:text-blue-300", children: "Reset search" }) }),
          !filteredTypes.length && /* @__PURE__ */ jsxRuntimeExports.jsx(
            SettingsEmptyState,
            {
              title: "No matching asset types",
              description: "Try a different search term.",
              action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400 hover:text-blue-300", children: "Reset search" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: detailRef, tabIndex: "-1", className: `${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`, children: definition ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              hasChangedView.current = true;
              setShowMobileDetail(false);
            }, className: "lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm", children: "← Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: definition.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-zinc-500", children: [
                usageCounts[selectedKey] || 0,
                " current asset",
                usageCounts[selectedKey] === 1 ? "" : "s"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDeleteKey(selectedKey),
              title: usageCounts[selectedKey] ? "Cannot delete a type used by assets" : "Delete",
              disabled: !!usageCounts[selectedKey],
              className: "h-10 w-10 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-40",
              children: "🗑️"
            }
          )
        ] }),
        !!usageCounts[selectedKey] && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-zinc-500", children: [
          "This type cannot be deleted because ",
          usageCounts[selectedKey],
          " asset",
          usageCounts[selectedKey] === 1 ? " uses" : "s use",
          " it."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-4 rounded-xl border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Asset type name", value: definition.name, onChange: (name) => updateName(selectedKey, name) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Scope behavior" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: scopeRule.mode || "user", onChange: (event) => updateScopeRule(selectedKey, { mode: event.target.value }), className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User selects" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "default", children: "Default" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "locked", children: "Locked" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Portfolio scope" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: scopeRule.value || "", onChange: (event) => updateScopeRule(selectedKey, { value: event.target.value }), disabled: scopeRule.mode === "user", className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select scope" }),
                Object.entries(portfolioScopeOptions).map(([key, option]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: key, children: option.name }, key))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Locked", value: ruleCounts.locked }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Defaults", value: ruleCounts.default }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "User selects", value: ruleCounts.user }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Not applicable", value: ruleCounts.na })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium", children: "Dimension rules" }),
          Object.entries(dimensions).filter(([key]) => key !== "ownership").map(([dimensionKey, dimension]) => {
            const rule = definition.dimensionRules?.[dimensionKey] || { mode: "user", value: "" };
            const valueName = dimension.values?.[rule.value]?.name;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              CollapsiblePanel,
              {
                title: dimension.name,
                summary: `${ruleModeLabels[rule.mode] || "User selects"}${valueName ? ` · ${valueName}` : ""}`,
                open: openDimension === dimensionKey,
                onToggle: () => setOpenDimension((current) => current === dimensionKey ? "" : dimensionKey),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Rule" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: rule.mode || "user", onChange: (event) => updateRule(selectedKey, dimensionKey, { mode: event.target.value }), className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User selects" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "default", children: "Default" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "locked", children: "Locked" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "na", children: "Not applicable" })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Value" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: rule.value || "", onChange: (event) => updateRule(selectedKey, dimensionKey, { value: event.target.value }), disabled: rule.mode === "user" || rule.mode === "na", className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-2 py-2 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-blue-500", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select value" }),
                      Object.entries(dimension.values || {}).map(([valueKey, value]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: valueKey, children: value.name }, valueKey))
                    ] })
                  ] })
                ] })
              },
              dimensionKey
            );
          })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No asset types", description: "Add an asset type to configure its portfolio scope and dimension rules.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddOpen(true), className: "rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500", children: "➕ Add type" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NameDialog, { open: addOpen, title: "Add asset type", label: "Asset type name", initialValue: initialNewName, existingNames: Object.values(assetTypes).map((type) => type.name), onClose: () => setAddOpen(false), onSave: addType }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: !!deleteKey, title: "Delete asset type?", message: deleteKey ? `Delete “${assetTypes[deleteKey]?.name}” from the available asset types?` : "", onCancel: () => setDeleteKey(""), onConfirm: () => removeType(deleteKey) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo ? "Asset type deleted." : "", onUndo: () => {
      if (!undo) return;
      setAssetTypes({ ...assetTypes, [undo.key]: undo.definition });
      setSelectedKey(undo.key);
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
function LiabilityTypeManager({ liabilityTypes, setLiabilityTypes, liabilities, initialNewName = "" }) {
  const [selectedKey, setSelectedKey] = reactExports.useState(() => Object.keys(liabilityTypes)[0] || "");
  const [query, setQuery] = reactExports.useState("");
  const [showMobileDetail, setShowMobileDetail] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteKey, setDeleteKey] = reactExports.useState("");
  const [undo, setUndo] = reactExports.useState(null);
  const detailRef = reactExports.useRef(null);
  const selectedButtonRef = reactExports.useRef(null);
  const hasChangedView = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!liabilityTypes[selectedKey]) setSelectedKey(Object.keys(liabilityTypes)[0] || "");
  }, [liabilityTypes, selectedKey]);
  reactExports.useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);
  const usageCounts = reactExports.useMemo(() => {
    const counts = {};
    for (const liability of liabilities || []) counts[liability.type] = (counts[liability.type] || 0) + 1;
    return counts;
  }, [liabilities]);
  const filtered = reactExports.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(liabilityTypes).filter(([key, definition2]) => key === selectedKey || !needle || definition2.name.toLowerCase().includes(needle));
  }, [liabilityTypes, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(liabilityTypes).some((definition2) => definition2.name.toLowerCase().includes(query.trim().toLowerCase()));
  function updateName(key, name) {
    setLiabilityTypes({ ...liabilityTypes, [key]: { ...liabilityTypes[key], name } });
  }
  function addType(name) {
    const key = mkId();
    hasChangedView.current = true;
    setLiabilityTypes({ ...liabilityTypes, [key]: { name } });
    setSelectedKey(key);
    setShowMobileDetail(true);
    setAddOpen(false);
  }
  function removeType(key) {
    if (usageCounts[key]) return;
    const removed = liabilityTypes[key];
    const { [key]: _discard, ...rest } = liabilityTypes;
    hasChangedView.current = true;
    setLiabilityTypes(rest);
    setSelectedKey(Object.keys(rest)[0] || "");
    setShowMobileDetail(false);
    setDeleteKey("");
    setUndo({ key, definition: removed });
  }
  const definition = liabilityTypes[selectedKey];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSectionHeader, { title: "Liability Types", description: "Manage the simple categories used by liabilities in Total Net Worth." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-[28rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-zinc-800 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddOpen(true), title: "Add type", className: "h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "➕" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Search liability types", value: query, onChange: setQuery })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[24rem] overflow-y-auto p-2", children: [
          filtered.map(([key, type]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                hasChangedView.current = true;
                setSelectedKey(key);
                setShowMobileDetail(true);
              },
              "aria-current": selectedKey === key ? "true" : void 0,
              ref: selectedKey === key ? selectedButtonRef : void 0,
              className: `mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium", children: type.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`, children: [
                  usageCounts[key] || 0,
                  " liabilities"
                ] })
              ]
            },
            key
          )),
          !hasQueryMatch && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No other matching liability types", description: "The selected type remains visible while you search.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400", children: "Reset search" }) }),
          !filtered.length && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No matching liability types", description: "Try a different search term.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400", children: "Reset search" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: detailRef, tabIndex: "-1", className: `${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`, children: definition ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              hasChangedView.current = true;
              setShowMobileDetail(false);
            }, className: "lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm", children: "← Types" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: definition.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-zinc-500", children: [
                usageCounts[selectedKey] || 0,
                " current liabilit",
                usageCounts[selectedKey] === 1 ? "y" : "ies"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setDeleteKey(selectedKey),
              title: usageCounts[selectedKey] ? "Cannot delete a type used by liabilities" : "Delete",
              disabled: !!usageCounts[selectedKey],
              className: "h-10 w-10 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-40",
              children: "🗑️"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md rounded-xl border border-zinc-800 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Liability type name", value: definition.name, onChange: (value) => updateName(selectedKey, value) }),
          usageCounts[selectedKey] > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-zinc-500", children: "This type cannot be deleted while it is referenced by existing liabilities." })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No liability types", description: "Add a type before recording a liability.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddOpen(true), className: "rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500", children: "➕ Add type" }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NameDialog, { open: addOpen, title: "Add liability type", label: "Liability type name", initialValue: initialNewName, existingNames: Object.values(liabilityTypes).map((type) => type.name), onClose: () => setAddOpen(false), onSave: addType }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: !!deleteKey, title: "Delete liability type?", message: deleteKey ? `Delete “${liabilityTypes[deleteKey]?.name}” from the available liability types?` : "", onCancel: () => setDeleteKey(""), onConfirm: () => removeType(deleteKey) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo ? "Liability type deleted." : "", onUndo: () => {
      if (!undo) return;
      setLiabilityTypes({ ...liabilityTypes, [undo.key]: undo.definition });
      setSelectedKey(undo.key);
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
function DimensionManager({ dimensions, setDimensions, assetTypes, assets, strategy, initialNewValue = "" }) {
  const [selectedKey, setSelectedKey] = reactExports.useState(() => Object.keys(dimensions)[0] || "");
  const [query, setQuery] = reactExports.useState("");
  const [sortAsc, setSortAsc] = reactExports.useState(true);
  const [showMobileDetail, setShowMobileDetail] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteValue, setDeleteValue] = reactExports.useState(null);
  const [undo, setUndo] = reactExports.useState(null);
  const detailRef = reactExports.useRef(null);
  const selectedButtonRef = reactExports.useRef(null);
  const hasChangedView = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (!dimensions[selectedKey]) setSelectedKey(Object.keys(dimensions)[0] || "");
  }, [dimensions, selectedKey]);
  reactExports.useEffect(() => {
    if (!hasChangedView.current) return;
    if (showMobileDetail) detailRef.current?.focus();
    else selectedButtonRef.current?.focus();
  }, [showMobileDetail, selectedKey]);
  const filteredDimensions = reactExports.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return Object.entries(dimensions).filter(([key, dimension2]) => key === selectedKey || !needle || dimension2.name.toLowerCase().includes(needle));
  }, [dimensions, query, selectedKey]);
  const hasQueryMatch = !query.trim() || Object.values(dimensions).some((dimension2) => dimension2.name.toLowerCase().includes(query.trim().toLowerCase()));
  function referenceCount(dimensionKey, valueKey) {
    let count = 0;
    for (const asset of assets || []) {
      if (dimensionKey === "ownership") {
        if (asset.ownership === valueKey) count += 1;
      } else if (Object.prototype.hasOwnProperty.call(asset.dimensions?.[dimensionKey] || {}, valueKey)) count += 1;
    }
    for (const type of Object.values(assetTypes || {})) {
      if (type.dimensionRules?.[dimensionKey]?.value === valueKey) count += 1;
    }
    if (Object.prototype.hasOwnProperty.call(strategy?.dimensionPolicies?.[dimensionKey]?.categories || {}, valueKey)) count += 1;
    return count;
  }
  function renameDimension(key, name) {
    setDimensions({ ...dimensions, [key]: { ...dimensions[key], name } });
  }
  function renameValue(dimensionKey, valueKey, name) {
    const dimension2 = dimensions[dimensionKey];
    setDimensions({
      ...dimensions,
      [dimensionKey]: { ...dimension2, values: { ...dimension2.values, [valueKey]: { ...dimension2.values[valueKey], name } } }
    });
  }
  function addValue(dimensionKey, name) {
    const key = mkId();
    setDimensions({
      ...dimensions,
      [dimensionKey]: { ...dimensions[dimensionKey], values: { ...dimensions[dimensionKey].values, [key]: { name } } }
    });
    setAddOpen(false);
  }
  function removeValue(dimensionKey, valueKey) {
    const references = referenceCount(dimensionKey, valueKey);
    if (references) return;
    const values = { ...dimensions[dimensionKey].values };
    const removed = values[valueKey];
    delete values[valueKey];
    setDimensions({ ...dimensions, [dimensionKey]: { ...dimensions[dimensionKey], values } });
    setDeleteValue(null);
    setUndo({ dimensionKey, valueKey, value: removed });
  }
  const dimension = dimensions[selectedKey];
  const sortedValues = reactExports.useMemo(() => {
    const entries = Object.entries(dimension?.values || {});
    return entries.sort((left, right) => (sortAsc ? 1 : -1) * left[1].name.localeCompare(right[1].name));
  }, [dimension, sortAsc]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSectionHeader, { title: "Dimensions", description: "Manage the reusable categories used for concentration analysis and asset-type rules." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid min-h-[34rem] lg:grid-cols-[17rem_minmax(0,1fr)] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `${showMobileDetail ? "hidden" : "block"} lg:block rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-zinc-800 p-3 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Dimensions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Search dimensions", value: query, onChange: setQuery })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[30rem] overflow-y-auto p-2", children: [
          filteredDimensions.map(([key, item]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => {
                hasChangedView.current = true;
                setSelectedKey(key);
                setShowMobileDetail(true);
              },
              "aria-current": selectedKey === key ? "true" : void 0,
              ref: selectedKey === key ? selectedButtonRef : void 0,
              className: `mb-1 w-full rounded-lg p-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedKey === key ? "bg-blue-600" : "hover:bg-zinc-800"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium", children: item.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `mt-1 block text-xs ${selectedKey === key ? "text-blue-100" : "text-zinc-500"}`, children: [
                  Object.keys(item.values || {}).length,
                  " values"
                ] })
              ]
            },
            key
          )),
          !hasQueryMatch && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No other matching dimensions", description: "The selected dimension remains visible while you search.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400", children: "Reset search" }) }),
          !filteredDimensions.length && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No matching dimensions", description: "Try a different search term.", action: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setQuery(""), className: "text-sm text-blue-400", children: "Reset search" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: detailRef, tabIndex: "-1", className: `${showMobileDetail ? "block" : "hidden"} lg:block min-w-0 focus:outline-none`, children: dimension ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
            hasChangedView.current = true;
            setShowMobileDetail(false);
          }, className: "lg:hidden rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm", children: "← Dimensions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium", children: dimension.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-zinc-500", children: [
              sortedValues.length,
              " configured value",
              sortedValues.length === 1 ? "" : "s"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md rounded-xl border border-zinc-800 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Dimension name", value: dimension.name, onChange: (name) => renameDimension(selectedKey, name) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-medium", children: "Values" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Values in use are protected from deletion." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setAddOpen(true), title: "Add value", className: "h-9 w-9 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500", children: "➕" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[32rem] text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { onClick: () => setSortAsc((value) => !value), className: "cursor-pointer px-4 py-2 text-left", children: [
                  "Value ",
                  sortAsc ? "▲" : "▼"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "References" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-16 px-4 py-2 text-right", children: "Delete" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedValues.map(([valueKey, value]) => {
                const references = referenceCount(selectedKey, valueKey);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Value", value: value.name, onChange: (name) => renameValue(selectedKey, valueKey, name) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-zinc-400", children: references ? `${references} portfolio reference${references === 1 ? "" : "s"}` : "Not used" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      title: references ? `Cannot delete: ${references} references` : "Delete",
                      disabled: !!references,
                      onClick: () => setDeleteValue({ dimensionKey: selectedKey, valueKey }),
                      className: "h-9 w-9 rounded-lg border border-red-900 bg-red-950/50 text-red-300 hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-40",
                      children: "🗑️"
                    }
                  ) })
                ] }, valueKey);
              }) })
            ] }),
            !sortedValues.length && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No values", description: "Add the first value for this dimension." })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsEmptyState, { title: "No dimensions", description: "No configurable concentration dimensions are available." }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NameDialog, { open: addOpen, title: `Add ${dimension?.name || "dimension"} value`, label: "Value name", initialValue: initialNewValue, existingNames: Object.values(dimension?.values || {}).map((value) => value.name), onClose: () => setAddOpen(false), onSave: (name) => addValue(selectedKey, name) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: !!deleteValue, title: "Delete dimension value?", message: deleteValue ? `Delete “${dimensions[deleteValue.dimensionKey]?.values?.[deleteValue.valueKey]?.name}” from ${dimensions[deleteValue.dimensionKey]?.name}?` : "", onCancel: () => setDeleteValue(null), onConfirm: () => deleteValue && removeValue(deleteValue.dimensionKey, deleteValue.valueKey) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo ? "Dimension value deleted." : "", onUndo: () => {
      if (!undo) return;
      const target = dimensions[undo.dimensionKey];
      setDimensions({ ...dimensions, [undo.dimensionKey]: { ...target, values: { ...target.values, [undo.valueKey]: undo.value } } });
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
const TARGET_TOTAL_UNITS = 100;
const MIN_TARGET_UNITS = 1;
function toUnits(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}
function toPercent(units) {
  return Math.round(units);
}
function fromUnits(entries) {
  return Object.fromEntries(entries.map(([key, units]) => [key, toPercent(units)]));
}
function normalizedUnitEntries(targets = {}) {
  const entries = Object.entries(targets).filter(([, value]) => Number(value) > 0);
  if (entries.length === 0) return [];
  const total = entries.reduce((sum, [, value]) => sum + Number(value), 0);
  const scaled = entries.map(([key, value], index) => {
    const exact = Number(value) / total * TARGET_TOTAL_UNITS;
    return { key, index, exact, units: Math.max(MIN_TARGET_UNITS, Math.floor(exact)) };
  });
  let difference = TARGET_TOTAL_UNITS - scaled.reduce((sum, entry) => sum + entry.units, 0);
  if (difference > 0) {
    const recipients = [...scaled].sort((a, b) => b.exact - b.units - (a.exact - a.units) || a.index - b.index);
    for (let index = 0; difference > 0; index = (index + 1) % recipients.length) {
      recipients[index].units += 1;
      difference -= 1;
    }
  } else if (difference < 0) {
    const donors = [...scaled].sort((a, b) => b.units - a.units || a.index - b.index);
    for (const donor of donors) {
      const available = donor.units - MIN_TARGET_UNITS;
      const transfer = Math.min(available, -difference);
      donor.units -= transfer;
      difference += transfer;
      if (difference === 0) break;
    }
  }
  return scaled.sort((a, b) => a.index - b.index).map(({ key, units }) => [key, units]);
}
function normalizeTargetAllocations(targets = {}) {
  return fromUnits(normalizedUnitEntries(targets));
}
function addTargetAllocation(targets = {}, category, initialPercent = 5) {
  if (!category) return normalizeTargetAllocations(targets);
  const entries = normalizedUnitEntries(targets).filter(([key]) => key !== category);
  if (entries.length === 0) return { [category]: 100 };
  const donor = [...entries].sort((a, b) => b[1] - a[1])[0];
  const requested = Math.max(MIN_TARGET_UNITS, toUnits(initialPercent));
  const newUnits = Math.max(MIN_TARGET_UNITS, Math.min(requested, donor[1] - MIN_TARGET_UNITS, Math.floor(donor[1] / 2)));
  donor[1] -= newUnits;
  entries.push([category, newUnits]);
  return fromUnits(entries);
}
function removeTargetAllocation(targets = {}, category) {
  const entries = normalizedUnitEntries(targets);
  if (entries.length <= 1 || !entries.some(([key]) => key === category)) return fromUnits(entries);
  const removed = entries.find(([key]) => key === category)[1];
  const remaining = entries.filter(([key]) => key !== category);
  const recipient = [...remaining].sort((a, b) => b[1] - a[1])[0];
  recipient[1] += removed;
  return fromUnits(remaining);
}
function setTargetAllocation(targets = {}, category, value) {
  const entries = normalizedUnitEntries(targets);
  const current = entries.find(([key]) => key === category);
  if (!current) return fromUnits(entries);
  if (entries.length === 1) return { [category]: 100 };
  const maximum = TARGET_TOTAL_UNITS - MIN_TARGET_UNITS * (entries.length - 1);
  const desired = Math.max(MIN_TARGET_UNITS, Math.min(maximum, toUnits(value)));
  let difference = desired - current[1];
  current[1] = desired;
  const others = entries.filter(([key]) => key !== category).sort((a, b) => b[1] - a[1]);
  if (difference > 0) {
    for (const donor of others) {
      const transfer = Math.min(donor[1] - MIN_TARGET_UNITS, difference);
      donor[1] -= transfer;
      difference -= transfer;
      if (difference === 0) break;
    }
  } else if (difference < 0) {
    others[0][1] += -difference;
  }
  return fromUnits(entries);
}
function adjustAdjacentTargets(targets = {}, leftCategory, rightCategory, desiredLeftPercent) {
  const entries = normalizedUnitEntries(targets);
  const left = entries.find(([key]) => key === leftCategory);
  const right = entries.find(([key]) => key === rightCategory);
  if (!left || !right) return fromUnits(entries);
  const combined = left[1] + right[1];
  const desiredLeft = Math.max(MIN_TARGET_UNITS, Math.min(combined - MIN_TARGET_UNITS, toUnits(desiredLeftPercent)));
  left[1] = desiredLeft;
  right[1] = combined - desiredLeft;
  return fromUnits(entries);
}
function formatPercent(value) {
  return `${Math.round(value)}%`;
}
function TargetAllocationBar({ allocations, labels = {}, onChange, ariaLabel = "Target allocation" }) {
  const barRef = reactExports.useRef(null);
  const draggingRef = reactExports.useRef(null);
  const normalized = normalizeTargetAllocations(allocations);
  const entries = Object.entries(normalized);
  let cumulativeUnits = 0;
  const boundaries = entries.slice(0, -1).map(([key, value], index) => {
    cumulativeUnits += toUnits(value);
    return {
      index,
      leftCategory: key,
      rightCategory: entries[index + 1][0],
      cumulativeUnits,
      prefixUnits: cumulativeUnits - toUnits(value)
    };
  });
  function labelFor2(category) {
    return labels[category]?.name || labels[category] || category;
  }
  function applyBoundaryClientX(boundary, clientX) {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const pointerUnits = Math.round(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * TARGET_TOTAL_UNITS);
    const desiredLeftUnits = pointerUnits - boundary.prefixUnits;
    onChange(adjustAdjacentTargets(normalized, boundary.leftCategory, boundary.rightCategory, toPercent(desiredLeftUnits)));
  }
  function adjustBoundary(boundary, deltaUnits) {
    const currentLeftUnits = toUnits(normalized[boundary.leftCategory]);
    onChange(adjustAdjacentTargets(
      normalized,
      boundary.leftCategory,
      boundary.rightCategory,
      toPercent(currentLeftUnits + deltaUnits)
    ));
  }
  if (entries.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-950/40 p-3", "data-target-allocation-bar": true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h5", { className: "text-sm font-medium text-zinc-200", children: "Visual allocation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-xs text-zinc-500", children: "Drag a divider to adjust its two neighbouring categories. Arrow keys move 1%." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-emerald-950 px-2 py-1 text-xs font-medium text-emerald-300", children: "100%" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: barRef, role: "group", "aria-label": ariaLabel, className: "relative touch-none select-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-14 overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900", children: entries.map(([category, value]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "flex min-w-0 items-center justify-center overflow-hidden px-1 text-center text-xs font-semibold text-zinc-950",
          style: { width: `${value}%`, backgroundColor: colorForCategory(category) },
          title: `${labelFor2(category)} ${formatPercent(value)}`,
          children: value >= 12 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate drop-shadow-sm", children: [
            labelFor2(category),
            " ",
            formatPercent(value)
          ] }) : value >= 7 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate drop-shadow-sm", children: formatPercent(value) }) : null
        },
        category
      )) }),
      boundaries.map((boundary) => {
        const leftValue = normalized[boundary.leftCategory];
        const rightValue = normalized[boundary.rightCategory];
        const combinedUnits = toUnits(leftValue) + toUnits(rightValue);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            role: "slider",
            "aria-label": `Adjust ${labelFor2(boundary.leftCategory)} and ${labelFor2(boundary.rightCategory)}`,
            "aria-valuemin": toPercent(boundary.prefixUnits + MIN_TARGET_UNITS),
            "aria-valuemax": toPercent(boundary.prefixUnits + combinedUnits - MIN_TARGET_UNITS),
            "aria-valuenow": toPercent(boundary.cumulativeUnits),
            "aria-valuetext": `${labelFor2(boundary.leftCategory)} ${formatPercent(leftValue)}, ${labelFor2(boundary.rightCategory)} ${formatPercent(rightValue)}`,
            title: `Drag to adjust ${labelFor2(boundary.leftCategory)} and ${labelFor2(boundary.rightCategory)}`,
            onPointerDown: (event) => {
              event.currentTarget.focus();
              event.preventDefault();
              draggingRef.current = event.pointerId;
              event.currentTarget.setPointerCapture?.(event.pointerId);
              applyBoundaryClientX(boundary, event.clientX);
            },
            onPointerMove: (event) => {
              if (draggingRef.current !== event.pointerId) return;
              applyBoundaryClientX(boundary, event.clientX);
            },
            onPointerUp: (event) => {
              if (draggingRef.current === event.pointerId) draggingRef.current = null;
              event.currentTarget.releasePointerCapture?.(event.pointerId);
            },
            onPointerCancel: () => {
              draggingRef.current = null;
            },
            onKeyDown: (event) => {
              let delta = 1;
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta *= -1;
              else if (event.key !== "ArrowRight" && event.key !== "ArrowUp") return;
              event.preventDefault();
              adjustBoundary(boundary, delta);
            },
            className: "absolute top-1/2 z-10 h-16 w-5 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded focus:outline-none focus:ring-2 focus:ring-blue-400",
            style: { left: `${toPercent(boundary.cumulativeUnits)}%` },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "mx-auto block h-12 w-1 rounded-full border border-zinc-950 bg-white shadow" })
          },
          `${boundary.leftCategory}:${boundary.rightCategory}`
        );
      })
    ] })
  ] });
}
const importanceLabels = { 1: "Low", 2: "Medium", 3: "High" };
const modeLabels = {
  disabled: "Disabled",
  informational: "Informational",
  target: "Target allocation",
  limits: "Minimum / maximum"
};
function hasValue(value) {
  return value !== "" && value != null;
}
function categoryConfiguredForMode(config = {}, mode) {
  if (mode === "target") return hasValue(config.target) && Number(config.target) > 0;
  if (mode === "limits") return hasValue(config.min) || hasValue(config.max);
  return false;
}
function StrategyEditor({ strategy, setStrategy, assetTypes, dimensions, currency, assets = [] }) {
  const [openKey, setOpenKey] = reactExports.useState("asset_type");
  const [rangeErrors, setRangeErrors] = reactExports.useState({});
  const [pendingCategories, setPendingCategories] = reactExports.useState({});
  const [categorySelections, setCategorySelections] = reactExports.useState({});
  function setCashReserveTarget(value) {
    setStrategy({ ...strategy, cashReserveTarget: value });
  }
  function updatePolicy(key, patch) {
    const current = strategy.dimensionPolicies?.[key] || {};
    setStrategy({
      ...strategy,
      dimensionPolicies: {
        ...strategy.dimensionPolicies,
        [key]: { ...current, ...patch }
      }
    });
  }
  function currentTargetAllocations(categories = {}) {
    return Object.fromEntries(
      Object.entries(categories).filter(([, config]) => categoryConfiguredForMode(config, "target")).map(([category, config]) => [category, Number(config.target)])
    );
  }
  function updateTargetAllocations(dimensionKey, allocations) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    const nextCategories = { ...categories };
    for (const [category, config] of Object.entries(categories)) {
      if (!Object.prototype.hasOwnProperty.call(config, "target") || Object.prototype.hasOwnProperty.call(allocations, category)) continue;
      const nextConfig = { ...config };
      delete nextConfig.target;
      if (Object.keys(nextConfig).length > 0) nextCategories[category] = nextConfig;
      else delete nextCategories[category];
    }
    for (const [category, target] of Object.entries(allocations)) {
      nextCategories[category] = { ...nextCategories[category] || {}, target };
    }
    updatePolicy(dimensionKey, { categories: nextCategories });
  }
  function pendingKey(dimensionKey, mode) {
    return `${dimensionKey}:${mode}`;
  }
  function removePendingCategory(dimensionKey, mode, category) {
    const key = pendingKey(dimensionKey, mode);
    setPendingCategories((pending) => ({
      ...pending,
      [key]: (pending[key] || []).filter((item) => item !== category)
    }));
  }
  function removeCategoryRule(dimensionKey, category, mode) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    if (mode === "target") {
      const targets = currentTargetAllocations(categories);
      if (Object.keys(targets).length <= 1) return;
      updateTargetAllocations(dimensionKey, removeTargetAllocation(targets, category));
      removePendingCategory(dimensionKey, mode, category);
      return;
    }
    const current = { ...categories[category] || {} };
    if (mode === "limits") {
      delete current.min;
      delete current.max;
    }
    const nextCategories = { ...categories };
    if (Object.keys(current).length > 0) nextCategories[category] = current;
    else delete nextCategories[category];
    updatePolicy(dimensionKey, { categories: nextCategories });
    removePendingCategory(dimensionKey, mode, category);
    setRangeErrors((errors) => {
      const errorKey = `${dimensionKey}:${category}`;
      if (!errors[errorKey]) return errors;
      const next = { ...errors };
      delete next[errorKey];
      return next;
    });
  }
  function addCategoryRule(dimensionKey, mode, category) {
    if (!category) return;
    if (mode === "target") {
      const categories = strategy.dimensionPolicies?.[dimensionKey]?.categories || {};
      updateTargetAllocations(dimensionKey, addTargetAllocation(currentTargetAllocations(categories), category));
      removePendingCategory(dimensionKey, mode, category);
      return;
    }
    const key = pendingKey(dimensionKey, mode);
    setPendingCategories((pending) => ({
      ...pending,
      [key]: Array.from(/* @__PURE__ */ new Set([...pending[key] || [], category]))
    }));
  }
  function updateCategory(dimensionKey, category, field, value) {
    const policy = strategy.dimensionPolicies?.[dimensionKey] || {};
    const categories = policy.categories || {};
    if (policy.mode === "target" && field === "target") {
      updateTargetAllocations(dimensionKey, setTargetAllocation(currentTargetAllocations(categories), category, value));
      removePendingCategory(dimensionKey, policy.mode, category);
      return;
    }
    const current = categories[category] || {};
    const nextMinimum = field === "min" ? value : current.min;
    const nextMaximum = field === "max" ? value : current.max;
    const errorKey = `${dimensionKey}:${category}`;
    if (nextMinimum !== "" && nextMinimum != null && nextMaximum !== "" && nextMaximum != null && Number(nextMinimum) > Number(nextMaximum)) {
      setRangeErrors((errors) => ({ ...errors, [errorKey]: "Minimum cannot exceed maximum." }));
      return;
    }
    setRangeErrors((errors) => {
      if (!errors[errorKey]) return errors;
      const next = { ...errors };
      delete next[errorKey];
      return next;
    });
    if (policy.mode === "limits" && !hasValue(nextMinimum) && !hasValue(nextMaximum)) {
      removeCategoryRule(dimensionKey, category, policy.mode);
      return;
    }
    updatePolicy(dimensionKey, {
      categories: {
        ...categories,
        [category]: { ...categories[category], [field]: value }
      }
    });
    removePendingCategory(dimensionKey, policy.mode, category);
  }
  const keys = ["asset_type", ...Object.keys(dimensions)];
  const summaries = reactExports.useMemo(() => Object.fromEntries(keys.map((key) => {
    const policy = strategy.dimensionPolicies?.[key] || { mode: "informational", categories: {} };
    const total = Object.values(policy.categories || {}).reduce((sum, config) => sum + (Number(config.target) > 0 ? Number(config.target) : 0), 0);
    const configuredCount = Object.values(policy.categories || {}).filter((config) => categoryConfiguredForMode(config, policy.mode)).length;
    const hasFractionalTargets = Object.values(policy.categories || {}).some((config) => Number(config.target) > 0 && !Number.isInteger(Number(config.target)));
    return [key, {
      policy,
      total,
      configuredCount,
      hasFractionalTargets,
      invalid: policy.mode === "target" && (Math.abs(total - 100) >= 0.01 || hasFractionalTargets)
    }];
  })), [keys.join("|"), strategy]);
  const issueCount = Object.values(summaries).filter((summary) => summary.invalid).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsSectionHeader,
      {
        title: "Strategy",
        description: "Targets, limits, and surplus-cash recommendations are evaluated against the Financial Portfolio.",
        right: issueCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-zinc-950", children: [
          issueCount,
          " issue",
          issueCount === 1 ? "" : "s"
        ] }) : null
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-[minmax(0,1fr)_14rem] gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-blue-900/70 bg-blue-950/20 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          MoneyInput,
          {
            label: `Checking-account cash reserve (${currency})`,
            value: String(strategy.cashReserveTarget || 0),
            onChange: setCashReserveTarget,
            currency
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-zinc-400", children: "Explicit account reserves are assigned first. Checking accounts left automatic divide the remaining amount equally." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Configured dimensions", value: `${keys.length}`, description: `${issueCount} target validation issue${issueCount === 1 ? "" : "s"}`, tone: issueCount ? "warning" : "default" })
    ] }),
    issueCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(SettingsValidation, { children: [
      issueCount,
      " target allocation ",
      issueCount === 1 ? "requires" : "require",
      " normalization to whole percentages totaling 100%."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: keys.map((key) => {
      const { policy, total, configuredCount, hasFractionalTargets, invalid } = summaries[key];
      const registry = dimensionRegistry(key, assetTypes, dimensions);
      const categories = policy.categories || {};
      const currentAmounts = currentByDimension(assets, key, assetTypes, {}, "financial");
      const mode = policy.mode || "informational";
      const ruleKey = pendingKey(key, mode);
      const configuredCategoryKeys = Object.keys(categories).filter((category) => categoryConfiguredForMode(categories[category], mode));
      const renderedCategoryKeys = Array.from(/* @__PURE__ */ new Set([...configuredCategoryKeys, ...pendingCategories[ruleKey] || []]));
      const categoryKeys = Array.from(/* @__PURE__ */ new Set([...Object.keys(registry), ...Object.keys(currentAmounts), ...Object.keys(categories)]));
      const availableCategoryKeys = categoryKeys.filter((category) => !renderedCategoryKeys.includes(category));
      const selectedCategory = availableCategoryKeys.includes(categorySelections[ruleKey]) ? categorySelections[ruleKey] : availableCategoryKeys[0] || "";
      const absentConfigured = configuredCategoryKeys.filter((category) => !(Number(currentAmounts[category]) > 0));
      const targetAllocations = currentTargetAllocations(categories);
      const importance = importanceLabels[policy.importance || 1];
      const summary = `${modeLabels[policy.mode] || "Informational"} · ${importance} importance · ${configuredCount} configured categor${configuredCount === 1 ? "y" : "ies"}`;
      const status = invalid ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-medium text-zinc-950", children: hasFractionalTargets && Math.abs(total - 100) < 0.01 ? "Round values" : `Total ${total}%` }) : policy.mode === "target" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-400", children: "100%" }) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        CollapsiblePanel,
        {
          title: dimensionName(key, dimensions),
          summary,
          status,
          open: openKey === key,
          onToggle: () => setOpenKey((current) => current === key ? "" : key),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-3 gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Mode" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: policy.mode || "informational",
                    onChange: (event) => updatePolicy(key, { mode: event.target.value }),
                    className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "disabled", children: "Disabled" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "informational", children: "Informational" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "target", children: "Target allocation" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "limits", children: "Minimum / maximum" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                NumberInput,
                {
                  label: "Tolerance pp",
                  value: String(policy.tolerance ?? 2),
                  min: 0,
                  max: 100,
                  precision: 2,
                  onChange: (value) => updatePolicy(key, { tolerance: value }),
                  disabled: policy.mode !== "target"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Importance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: String(policy.importance || 1),
                    onChange: (event) => updatePolicy(key, { importance: Number(event.target.value) }),
                    disabled: policy.mode !== "target" && policy.mode !== "limits",
                    className: "mt-1 w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Low" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Medium" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "High" })
                    ]
                  }
                )
              ] })
            ] }),
            (policy.mode === "target" || policy.mode === "limits") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3 xl:flex-row xl:items-end xl:justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-medium text-zinc-200", children: policy.mode === "target" ? "Target categories" : "Allocation limits" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-zinc-500", children: policy.mode === "target" ? "Targets always total 100%. Adding, removing, dragging, or editing a value automatically rebalances the other categories." : "Only configured limits are listed. Unlisted categories have no minimum or maximum." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 w-full items-end gap-2 xl:w-auto", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "min-w-0 flex-1 text-sm xl:w-52 xl:flex-none", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-400", children: "Category to add" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "select",
                      {
                        "aria-label": `${dimensionName(key, dimensions)} category to add`,
                        value: selectedCategory,
                        onChange: (event) => setCategorySelections((selections) => ({ ...selections, [ruleKey]: event.target.value })),
                        disabled: availableCategoryKeys.length === 0,
                        className: "mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500",
                        children: availableCategoryKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All categories added" }) : availableCategoryKeys.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: category, children: registry[category]?.name || category }, category))
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      "aria-label": `Add ${dimensionName(key, dimensions)} category`,
                      onClick: () => addCategoryRule(key, policy.mode, selectedCategory),
                      disabled: !selectedCategory,
                      className: "h-[42px] whitespace-nowrap rounded-lg bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "mr-1 text-lg leading-none", children: "+" }),
                        " Add category"
                      ]
                    }
                  )
                ] })
              ] }),
              policy.mode === "target" && configuredCategoryKeys.length > 0 && !invalid && /* @__PURE__ */ jsxRuntimeExports.jsx(
                TargetAllocationBar,
                {
                  allocations: targetAllocations,
                  labels: registry,
                  ariaLabel: `${dimensionName(key, dimensions)} target allocation`,
                  onChange: (allocations) => updateTargetAllocations(key, allocations)
                }
              ),
              policy.mode === "target" && configuredCategoryKeys.length > 0 && invalid && /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsValidation, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  Math.abs(total - 100) >= 0.01 ? `Existing targets total ${total}%.` : "Existing targets use decimal percentages.",
                  " Convert them to whole percentages before using the visual allocation bar."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => updateTargetAllocations(key, normalizeTargetAllocations(targetAllocations)),
                    className: "rounded-lg bg-amber-300 px-3 py-1.5 text-xs font-medium text-zinc-950 hover:bg-amber-200",
                    children: hasFractionalTargets ? "Round to whole %" : "Normalize to 100%"
                  }
                )
              ] }) }),
              renderedCategoryKeys.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-dashed border-zinc-800 px-3 py-4 text-center text-sm text-zinc-500", children: [
                "No ",
                policy.mode === "target" ? "target categories" : "allocation limits",
                " configured.",
                policy.mode === "target" ? " Add the first category to assign it 100%." : ""
              ] }),
              renderedCategoryKeys.map((category) => {
                const definition = registry[category];
                const absent = !(Number(currentAmounts[category]) > 0);
                const configured = categoryConfiguredForMode(categories[category], policy.mode);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    "data-category-rule": category,
                    className: `grid gap-2 items-end rounded-lg px-3 py-2 ${policy.mode === "target" ? "sm:grid-cols-[minmax(0,1fr)_8rem_2.5rem]" : "sm:grid-cols-[minmax(0,1fr)_8rem_8rem_2.5rem]"} ${absent ? "bg-amber-950/15" : "bg-zinc-950/30"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-2 text-sm text-zinc-300", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                          policy.mode === "target" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": "true", className: "h-2.5 w-2.5 shrink-0 rounded-sm", style: { backgroundColor: colorForCategory(category) } }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: definition?.name || category })
                        ] }),
                        absent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-amber-400", children: configured ? "Configured but absent from the Financial Portfolio" : "Not currently present in the Financial Portfolio" })
                      ] }),
                      policy.mode === "target" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                        PercentageInput,
                        {
                          label: "Target %",
                          value: String(categories[category]?.target ?? ""),
                          min: configuredCategoryKeys.length > 1 ? 1 : 100,
                          max: configuredCategoryKeys.length > 1 ? 100 - (configuredCategoryKeys.length - 1) : 100,
                          precision: 0,
                          disabled: configuredCategoryKeys.length === 1,
                          onChange: (value) => updateCategory(key, category, "target", value)
                        }
                      ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(PercentageInput, { label: "Minimum %", value: String(categories[category]?.min ?? ""), required: false, onChange: (value) => updateCategory(key, category, "min", value), externalError: rangeErrors[`${key}:${category}`] || "" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(PercentageInput, { label: "Maximum %", value: String(categories[category]?.max ?? ""), required: false, onChange: (value) => updateCategory(key, category, "max", value) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "button",
                        {
                          type: "button",
                          "aria-label": `Remove ${definition?.name || category} ${policy.mode === "target" ? "target" : "limits"}`,
                          title: "Remove rule",
                          onClick: () => removeCategoryRule(key, category, policy.mode),
                          disabled: policy.mode === "target" && configuredCategoryKeys.length <= 1,
                          className: "mb-0.5 grid h-10 w-10 place-items-center rounded-lg text-red-400 hover:bg-red-950/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-35",
                          children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { "aria-hidden": "true", viewBox: "0 0 24 24", className: "h-5 w-5 fill-none stroke-current", strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5" }) })
                        }
                      )
                    ]
                  },
                  category
                );
              }),
              absentConfigured.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Saved settings for absent categories are retained so they are available if matching Financial assets are added later." })
            ] })
          ] })
        },
        key
      );
    }) })
  ] });
}
const sections = [
  { key: "general", label: "General" },
  { key: "views", label: "Portfolio Views" },
  { key: "strategy", label: "Strategy" },
  { key: "asset_types", label: "Asset Types" },
  { key: "dimensions", label: "Dimensions" },
  { key: "liability_types", label: "Liability Types" },
  { key: "data", label: "Data & Integrations" }
];
function GeneralSettings({ currency, setCurrency, assets, referencedCurrencies = [] }) {
  const currencies = Array.from(/* @__PURE__ */ new Set([...referencedCurrencies, ...(assets || []).map((asset) => asset.pricingCurrency).filter(Boolean)]));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSectionHeader, { title: "General", description: "Portfolio-wide display settings." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CurrencySelect, { label: "Base currency", value: currency, onChange: setCurrency, referencedCurrencies: currencies }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-zinc-500", children: "Values and totals are displayed in this currency. Asset pricing currencies and FX rates remain separate." })
    ] })
  ] });
}
function PortfolioViewSettings({ assets, liabilities, currency, onReviewScopes }) {
  const metrics = reactExports.useMemo(() => portfolioMetrics(assets, liabilities), [assets, liabilities]);
  const active = assets || [];
  const counts = {
    total: active.length,
    investable: active.filter((asset) => assetInPortfolioView(asset, "investable")).length,
    financial: active.filter((asset) => assetInPortfolioView(asset, "financial")).length
  };
  const reviewCount = active.filter((asset) => asset.scopeNeedsReview).length;
  const values = {
    total: metrics.totalNetWorth,
    investable: metrics.investableAssets,
    financial: metrics.financialPortfolio
  };
  const descriptions = {
    total: "All active material assets less simplified liabilities.",
    investable: "Accessible assets that can be invested or rebalanced.",
    financial: "Assets actively managed under the investment strategy."
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsSectionHeader,
      {
        title: "Portfolio Views",
        description: "Each asset has one scope. Narrower scopes are automatically included in the broader views."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center text-sm text-zinc-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-300", children: "Financial Portfolio" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2 text-zinc-600", children: "⊆" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-300", children: "Investable Assets" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mx-2 text-zinc-600", children: "⊆" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-300", children: "Total Assets" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-3", children: Object.entries(portfolioViews).map(([key, view]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsSummaryCard,
      {
        label: view.name,
        value: formatCurrency(values[key], currency),
        description: `${counts[key]} active asset${counts[key] === 1 ? "" : "s"} · ${descriptions[key]}`
      },
      key
    )) }),
    reviewCount > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsValidation, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        reviewCount,
        " asset",
        reviewCount === 1 ? "" : "s",
        " still require a portfolio-scope review."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onReviewScopes, className: "rounded-lg bg-amber-700 px-3 py-2 text-xs text-white hover:bg-amber-600", children: "Review assets" })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsValidation, { valid: true, children: "All active assets have a confirmed portfolio scope." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-500", children: "Scope semantics are fixed. Change an individual asset’s scope from its edit dialog, or configure defaults and locks under Asset Types." })
  ] });
}
function DataSettings({ driveConfigured, driveAvailable, onEditJson, onExportBackup, onImportBackup }) {
  const [advancedOpen, setAdvancedOpen] = reactExports.useState(false);
  const driveLabel = driveAvailable ? "Available" : driveConfigured ? "Unavailable" : "Not configured";
  const driveDescription = driveAvailable ? "Google Drive operations are ready." : driveConfigured ? "Google Drive initialization failed, so Drive operations are disabled." : "This build does not contain the required Google API credentials.";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSectionHeader, { title: "Data & Integrations", description: "File storage, integrations, and advanced portfolio controls." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Portfolio data", value: "Backup available", description: "Export the current in-memory state independently of the backing file." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsSummaryCard, { label: "Google Drive", value: driveLabel, description: driveDescription, tone: driveAvailable ? "default" : "warning" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: "Backup and restore" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-zinc-500", children: "Download an encrypted or readable JSON backup, including changes that have not been saved to the active file." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onExportBackup, className: "rounded-lg bg-blue-600 px-3 py-2 text-sm hover:bg-blue-500", children: "Export backup" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onImportBackup, className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700", children: "Import backup" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsiblePanel,
      {
        title: "Advanced",
        summary: "Inspect or edit the raw portfolio JSON",
        open: advancedOpen,
        onToggle: () => setAdvancedOpen((value) => !value),
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsValidation, { children: "Manual structural changes or invalid data can make the portfolio unreadable. Use this only when you understand the file structure." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onEditJson, title: "Edit JSON", className: "rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700", children: "Edit JSON" })
        ] })
      }
    )
  ] });
}
function ConfigPage({
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  currency,
  setCurrency,
  dimensions,
  setDimensions,
  strategy,
  setStrategy,
  assets,
  liabilities,
  dirty = false,
  driveConfigured = false,
  driveAvailable = false,
  onEditJson,
  onExportBackup,
  onImportBackup,
  onDone,
  onReviewScopes,
  referencedCurrencies = [],
  nestedDialogOpen = false
}) {
  const [activeSection, setActiveSection] = reactExports.useState("general");
  const mainRef = reactExports.useRef(null);
  const firstSectionRender = reactExports.useRef(true);
  const targetIssues = Object.values(strategy.dimensionPolicies || {}).filter((policy) => {
    if (policy.mode !== "target") return false;
    const categories = Object.values(policy.categories || {});
    const total = categories.reduce((sum, category) => sum + (Number(category.target) || 0), 0);
    return Math.abs(total - 100) >= 0.01 || categories.some((category) => Number(category.target) > 0 && !Number.isInteger(Number(category.target)));
  }).length;
  const reviewCount = (assets || []).filter((asset) => asset.scopeNeedsReview).length;
  const issueCounts = { views: reviewCount, strategy: targetIssues };
  reactExports.useEffect(() => {
    if (firstSectionRender.current) {
      firstSectionRender.current = false;
      return;
    }
    mainRef.current?.focus();
  }, [activeSection]);
  reactExports.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  reactExports.useEffect(() => {
    if (nestedDialogOpen) return void 0;
    function keydown(event) {
      if (event.key !== "Escape") return;
      window.setTimeout(() => {
        if (!event.defaultPrevented) onDone?.();
      }, 0);
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [nestedDialogOpen, onDone]);
  function content() {
    if (activeSection === "general") return /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralSettings, { currency, setCurrency, assets, referencedCurrencies });
    if (activeSection === "views") return /* @__PURE__ */ jsxRuntimeExports.jsx(PortfolioViewSettings, { assets, liabilities, currency, onReviewScopes });
    if (activeSection === "strategy") return /* @__PURE__ */ jsxRuntimeExports.jsx(StrategyEditor, { strategy, setStrategy, assetTypes, dimensions, currency, assets });
    if (activeSection === "asset_types") return /* @__PURE__ */ jsxRuntimeExports.jsx(AssetTypeManager, { assetTypes, setAssetTypes, assets, dimensions });
    if (activeSection === "dimensions") return /* @__PURE__ */ jsxRuntimeExports.jsx(DimensionManager, { dimensions, setDimensions, assetTypes, assets, strategy });
    if (activeSection === "liability_types") return /* @__PURE__ */ jsxRuntimeExports.jsx(LiabilityTypeManager, { liabilityTypes, setLiabilityTypes, liabilities });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DataSettings, { driveConfigured, driveAvailable, onEditJson, onExportBackup, onImportBackup });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-30 flex max-w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100", role: "dialog", "aria-modal": "true", "aria-label": "Settings", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "shrink-0 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 md:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold", children: "Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: dirty ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: "● Unsaved portfolio changes" }) : "No unsaved changes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onDone, title: "Done", className: "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400", children: "Done" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 border-b border-zinc-800 p-3 md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Settings section" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: activeSection, onChange: (event) => setActiveSection(event.target.value), className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: section.key, children: [
        section.label,
        issueCounts[section.key] ? ` (${issueCounts[section.key]})` : ""
      ] }, section.key)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex min-h-0 w-full max-w-7xl flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden w-60 shrink-0 overflow-y-auto border-r border-zinc-800 p-3 md:block", "aria-label": "Settings sections", children: sections.map((section) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setActiveSection(section.key),
          "aria-current": activeSection === section.key ? "page" : void 0,
          className: `mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${activeSection === section.key ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: section.label }),
            !!issueCounts[section.key] && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-amber-500 px-1.5 text-[11px] font-medium text-zinc-950", children: issueCounts[section.key] })
          ]
        },
        section.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { ref: mainRef, className: "min-w-0 flex-1 overflow-y-auto p-4 focus:outline-none md:p-6", tabIndex: "-1", children: content() })
    ] })
  ] });
}
function ClosePortfolioModal({ open, canSave, loading, onCancel, onSaveAndClose, onDiscardAndClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title: "Close portfolio?",
      description: "The portfolio contains changes that have not been saved.",
      onClose: onCancel,
      size: "max-w-md",
      deleteAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: loading, onClick: onDiscardAndClose, className: "rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600 disabled:opacity-40", children: "Close without saving" }),
      primaryAction: canSave ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: loading, onClick: onSaveAndClose, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:opacity-40", children: loading ? "Saving…" : "Save and close" }) : null,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-300", children: canSave ? "Save the latest changes before closing, or close without saving them." : "This sample portfolio has no backing file. Close it to return to the opening screen." })
    }
  );
}
function EditAssetModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AssetFormModal, { ...props });
}
function EditLiabilityModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LiabilityFormModal, { ...props, onSave: props.onSave });
}
function JsonEditorModal({ open, onClose, data, onSave }) {
  const [text, setText] = reactExports.useState("");
  const [original, setOriginal] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!open) return;
    const next = JSON.stringify(data, null, 2);
    setText(next);
    setOriginal(next);
  }, [open, data]);
  let valid = true;
  try {
    JSON.parse(text);
  } catch {
    valid = false;
  }
  function handleSave(event) {
    event.preventDefault();
    if (!valid) return;
    onSave(JSON.parse(text));
    onClose();
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Modal,
    {
      open,
      title: "Edit portfolio JSON",
      description: "Advanced: invalid structural changes can make the portfolio unreadable.",
      onClose,
      dirty: text !== original,
      onSubmit: handleSave,
      size: "max-w-4xl",
      zIndex: "z-[60]",
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !valid, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: "Save JSON" }),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { autoFocus: true, className: "h-[55vh] w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100", value: text, onChange: (event) => setText(event.target.value) }),
        !valid && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-sm text-red-400", children: "Invalid JSON. Correct the syntax before saving." })
      ]
    }
  );
}
function LiabilityTable({ liabilities, prevLiabilities, setLiabilities, liabilityTypes, currency = "EUR", readOnly = false, onEdit }) {
  const [sort, setSort] = reactExports.useState({ key: null, asc: true });
  const [undo, setUndo] = reactExports.useState(null);
  const prevMap = new Map((prevLiabilities || []).map((liability) => [liability.id, Number(liability.value) || 0]));
  function updateValue(id, value) {
    if (readOnly) return;
    const previous = liabilities.find((liability) => liability.id === id);
    if (!previous || Number(previous.value) === Number(value)) return;
    setUndo({ liability: previous, message: `${previous.name}: balance updated.` });
    setLiabilities(liabilities.map((liability) => liability.id === id ? { ...liability, value } : liability));
  }
  const sortedLiabilities = [...liabilities];
  if (sort.key) {
    sortedLiabilities.sort((left, right) => {
      let a = left[sort.key];
      let b = right[sort.key];
      if (sort.key === "value") {
        a = Number(a) || 0;
        b = Number(b) || 0;
      } else if (sort.key === "type") {
        a = liabilityTypes[a]?.name || a;
        b = liabilityTypes[b]?.name || b;
      } else {
        a = (a || "").toString();
        b = (b || "").toString();
      }
      if (typeof a === "string") return sort.asc ? a.localeCompare(b) : b.localeCompare(a);
      return sort.asc ? a - b : b - a;
    });
  }
  function heading(label, key, align = "left") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { className: `${align === "right" ? "text-right" : "text-left"} cursor-pointer p-2`, onClick: () => setSort((current) => current.key === key ? { key, asc: !current.asc } : { key, asc: true }), children: [
      label,
      " ",
      sort.key === key ? sort.asc ? "▲" : "▼" : ""
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[560px] text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        heading("Name", "name"),
        heading("Type", "type"),
        heading("Balance", "value", "right"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "w-20 p-2 text-right", children: "Edit" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sortedLiabilities.map((liability) => {
        const hasPrevious = prevMap.has(liability.id);
        const previous = prevMap.get(liability.id) ?? 0;
        const delta = hasPrevious ? (Number(liability.value) || 0) - previous : null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", onDoubleClick: () => !readOnly && onEdit?.(liability), title: readOnly ? "Historical snapshot" : "Double-click to edit", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: liability.name }),
            liability.description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: liability.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: liabilityTypes[liability.type]?.name || liability.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2", children: [
            readOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatCurrency(liability.value, currency) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(NumberInput, { label: `${liability.name} balance`, kind: "money", currency, min: 0, precision: 2, value: liability.value, onChange: (value) => updateValue(liability.id, value), className: "w-36 [&>span:first-child]:sr-only", inputClassName: "border-transparent bg-transparent px-1 py-1 text-right hover:border-zinc-700 focus:bg-zinc-800" }),
            delta == null ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-zinc-500", title: "No matching liability in the previous snapshot", children: "—" }) : delta !== 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs ${delta > 0 ? "text-red-400" : "text-emerald-400"}`, children: [
              "(",
              formatCurrency(delta, currency),
              ")"
            ] }) : null
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: readOnly ? "—" : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => onEdit?.(liability), className: "rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700", children: "Edit" }) })
        ] }, liability.id);
      }) })
    ] }),
    !liabilities.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-5 text-center text-sm text-zinc-500", children: "No liabilities in this snapshot." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo?.message || "", onUndo: () => {
      if (!undo) return;
      setLiabilities(liabilities.map((liability) => liability.id === undo.liability.id ? undo.liability : liability));
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
function LineChart({
  data,
  currency = "EUR",
  showGridlines = true,
  showVerticalGridlines = false,
  showMarkers = true
}) {
  const canvasRef = reactExports.useRef(null);
  const tooltipRef = reactExports.useRef(null);
  const pointsRef = reactExports.useRef([]);
  const dimsRef = reactExports.useRef({ dpr: 1, width: 0, height: 0, padding: 0 });
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const HIT_RADIUS = 20;
    function draw(hoverIdx = null) {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      const padding = 32 * dpr;
      dimsRef.current = { dpr, width, height, padding };
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      if (!data.length) {
        ctx.fillStyle = "#9aa0a6";
        ctx.font = `${14 * dpr}px ui-sans-serif`;
        ctx.fillText("No data", 12 * dpr, 20 * dpr);
        return;
      }
      const xs = data.map((_, i) => i);
      const ys = data.map((d) => d.value || 0);
      const minVal = Math.min(...ys);
      const maxVal = Math.max(...ys);
      const minIdx = ys.indexOf(minVal);
      const maxIdx = ys.indexOf(maxVal);
      const minY = Math.min(minVal, 0);
      const maxY = Math.max(maxVal, 0);
      const xToPx = (x) => padding + x / Math.max(1, xs.length - 1) * (width - 2 * padding);
      const yToPx = (y) => height - padding - (y - minY) / Math.max(1, maxY - minY) * (height - 2 * padding);
      const yTickCount = 5;
      const yRange = maxY - minY;
      const yValues = [];
      if (yRange === 0) yValues.push(minY);
      else {
        for (let i = 0; i <= yTickCount; i++) {
          yValues.push(minY + i / yTickCount * yRange);
        }
      }
      const maxXTicks = Math.min(xs.length, 6);
      const xTickIdx = /* @__PURE__ */ new Set();
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round(i / Math.max(1, maxXTicks - 1) * (xs.length - 1));
        xTickIdx.add(idx);
      }
      if (showGridlines) {
        ctx.strokeStyle = "#3a3a3a";
        for (const val of yValues) {
          const py = yToPx(val);
          ctx.beginPath();
          ctx.moveTo(padding, py);
          ctx.lineTo(width - padding, py);
          ctx.stroke();
        }
        if (showVerticalGridlines) {
          for (const idx of xTickIdx) {
            const px = xToPx(xs[idx]);
            ctx.beginPath();
            ctx.moveTo(px, padding);
            ctx.lineTo(px, height - padding);
            ctx.stroke();
          }
        }
      }
      const points = [];
      ctx.beginPath();
      for (let i = 0; i < xs.length; i++) {
        const x = xToPx(xs[i]);
        const y = yToPx(ys[i]);
        points.push({ x, y, label: data[i].label, value: data[i].value });
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      pointsRef.current = points;
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#8ab4f8";
      ctx.stroke();
      const tickLen = 4 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (const val of yValues) {
        const py = yToPx(val);
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - tickLen, py);
        ctx.stroke();
        ctx.fillText(formatCurrency(val, currency), padding - 2 * tickLen, py);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      for (const idx of xTickIdx) {
        const px = xToPx(xs[idx]);
        ctx.beginPath();
        ctx.moveTo(px, height - padding);
        ctx.lineTo(px, height - padding + tickLen);
        ctx.stroke();
        const dateLabel = new Date(data[idx].label).toLocaleDateString();
        ctx.fillText(dateLabel, px, height - padding + tickLen + 2 * dpr);
      }
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      if (showMarkers) {
        ctx.font = `${10 * dpr}px ui-sans-serif`;
        if (maxIdx !== -1 && points[maxIdx]) {
          const high = points[maxIdx];
          ctx.fillStyle = "#16a34a";
          ctx.beginPath();
          ctx.arc(high.x, high.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("High", high.x + 4 * dpr, high.y - 6 * dpr);
        }
        if (minIdx !== -1 && points[minIdx]) {
          const low = points[minIdx];
          ctx.fillStyle = "#dc2626";
          ctx.beginPath();
          ctx.arc(low.x, low.y, 3 * dpr, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText("Low", low.x + 4 * dpr, low.y + 12 * dpr);
        }
      }
      const last = data[data.length - 1];
      const lx = xToPx(xs[xs.length - 1]);
      const ly = yToPx(ys[ys.length - 1]);
      ctx.fillStyle = "#e8eaed";
      ctx.font = `${12 * dpr}px ui-sans-serif`;
      ctx.fillText(`${last.label}: ${formatCurrency(last.value, currency)}`, lx - 100 * dpr, ly - 8 * dpr);
      if (hoverIdx != null && points[hoverIdx]) {
        const p = points[hoverIdx];
        ctx.beginPath();
        ctx.fillStyle = "#8ab4f8";
        ctx.arc(p.x, p.y, 3 * dpr, 0, Math.PI * 2);
        ctx.fill();
        if (tooltipRef.current) {
          tooltipRef.current.textContent = `${p.label}: ${formatCurrency(p.value, currency)}`;
          tooltipRef.current.style.display = "block";
          tooltipRef.current.style.left = `${p.x / dpr + 8}px`;
          tooltipRef.current.style.top = `${p.y / dpr - 24}px`;
        }
      } else if (tooltipRef.current) {
        tooltipRef.current.style.display = "none";
      }
    }
    function handleMove(e) {
      const { dpr, width, height, padding } = dimsRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * dpr;
      const y = (e.clientY - rect.top) * dpr;
      const points = pointsRef.current;
      if (!points.length) return draw();
      const ratio = (x - padding) / Math.max(1, width - 2 * padding);
      const approx = Math.round(ratio * (points.length - 1));
      let nearest = -1;
      let minDist = Infinity;
      for (let i = Math.max(0, approx - 2); i <= Math.min(points.length - 1, approx + 2); i++) {
        const p = points[i];
        const dist = Math.hypot(p.x - x, p.y - y);
        if (dist < minDist) {
          minDist = dist;
          nearest = i;
        }
      }
      if (minDist <= HIT_RADIUS * dpr) draw(nearest);
      else draw();
    }
    function handleOut() {
      draw();
    }
    draw();
    window.addEventListener("resize", draw);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseout", handleOut);
    return () => {
      window.removeEventListener("resize", draw);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseout", handleOut);
    };
  }, [data, currency, showGridlines, showVerticalGridlines, showMarkers]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref: tooltipRef,
        className: "pointer-events-none absolute hidden rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
      }
    )
  ] });
}
function PortfolioScopeFilter({ values, onToggle, title, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": title, children: Object.entries(portfolioScopeOptions).map(([key, scope]) => {
      const enabled = values.includes(key);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          role: "switch",
          "aria-checked": enabled,
          onClick: () => onToggle(key),
          title: scope.description,
          className: `flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm ${enabled ? "border-blue-500 bg-blue-950/50 text-blue-100" : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "data-switch-track": true, "aria-hidden": "true", className: `relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-zinc-600"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}` }) }),
            scope.name
          ]
        },
        key
      );
    }) })
  ] });
}
function PortfolioBackupModal({
  open,
  initialMode = "export",
  allowExport = true,
  defaultPassword = "",
  loading = false,
  error = "",
  hasUnsavedChanges = false,
  onClose,
  onExport,
  onImport
}) {
  const [mode, setMode] = reactExports.useState(initialMode);
  const [format, setFormat] = reactExports.useState("encrypted");
  const [password, setPassword] = reactExports.useState("");
  const [confirmation, setConfirmation] = reactExports.useState("");
  const [file, setFile] = reactExports.useState(null);
  const [validationError, setValidationError] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!open) return;
    const nextMode = allowExport ? initialMode : "import";
    setMode(nextMode);
    setFormat("encrypted");
    setPassword(nextMode === "export" ? defaultPassword : "");
    setConfirmation(nextMode === "export" ? defaultPassword : "");
    setFile(null);
    setValidationError("");
  }, [open, initialMode, allowExport, defaultPassword]);
  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword(nextMode === "export" ? defaultPassword : "");
    setConfirmation(nextMode === "export" ? defaultPassword : "");
    setFile(null);
    setValidationError("");
  }
  async function submit(event) {
    event.preventDefault();
    setValidationError("");
    if (mode === "export") {
      if (format === "encrypted" && !password) return setValidationError("Enter a password for the encrypted backup.");
      if (format === "encrypted" && password !== confirmation) return setValidationError("The backup passwords do not match.");
      const success2 = await onExport?.(format, format === "encrypted" ? password : "");
      if (success2 !== false) onClose?.();
      return;
    }
    if (!file) return setValidationError("Select an encrypted or JSON portfolio backup.");
    if (file.name?.toLowerCase().endsWith(".enc") && !password) return setValidationError("Enter the password for this encrypted backup.");
    const success = await onImport?.(file, password);
    if (success !== false) onClose?.();
  }
  const encryptedExport = mode === "export" && format === "encrypted";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Modal,
    {
      open,
      title: "Portfolio backup",
      description: "Export the current in-memory portfolio or restore a previous backup.",
      onClose,
      onSubmit: submit,
      size: "max-w-xl",
      primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: loading ? "Working…" : mode === "export" ? "Export backup" : "Import backup" }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        allowExport && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2 rounded-lg bg-zinc-950 p-1", role: "tablist", "aria-label": "Backup operation", children: [
          ["export", "Export"],
          ["import", "Import"]
        ].map(([key, label]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", role: "tab", "aria-selected": mode === key, onClick: () => changeMode(key), className: `rounded-md px-3 py-2 text-sm ${mode === key ? "bg-blue-600 text-white" : "text-zinc-400 hover:bg-zinc-800"}`, children: label }, key)) }),
        mode === "export" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("fieldset", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("legend", { className: "text-sm text-zinc-400", children: "Backup format" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 grid gap-2 md:grid-cols-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `cursor-pointer rounded-lg border p-3 ${format === "encrypted" ? "border-blue-500 bg-blue-950/30" : "border-zinc-800 bg-zinc-950/40"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "backup-format", value: "encrypted", checked: format === "encrypted", onChange: () => setFormat("encrypted"), className: "mr-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Encrypted (.enc)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-zinc-500", children: "Protected by a backup password." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: `cursor-pointer rounded-lg border p-3 ${format === "json" ? "border-blue-500 bg-blue-950/30" : "border-zinc-800 bg-zinc-950/40"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "radio", name: "backup-format", value: "json", checked: format === "json", onChange: () => setFormat("json"), className: "mr-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Readable JSON (.json)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 block text-xs text-zinc-500", children: "Portable and editable, but not encrypted." })
              ] })
            ] })
          ] }),
          encryptedExport ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Backup password", type: "password", value: password, onChange: setPassword, required: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Confirm password", type: "password", value: confirmation, onChange: setConfirmation, required: true })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-900/70 bg-amber-950/20 p-3 text-sm text-amber-200", children: "JSON backups contain all portfolio data in readable text. Store them somewhere private." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          hasUnsavedChanges && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-900/70 bg-amber-950/20 p-3 text-sm text-amber-200", children: "The active portfolio has unsaved changes. Export them first if you may need to return to them." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-zinc-400", children: [
              "Portfolio backup ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-400", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".enc,.json,application/octet-stream,application/json", onChange: (event) => {
              setFile(event.target.files?.[0] || null);
              setValidationError("");
            }, className: "mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:text-zinc-200 hover:file:bg-zinc-700" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Password (encrypted backups only)", type: "password", value: password, onChange: setPassword }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "The format is detected from the file contents. Import replaces the portfolio in memory; the current local or Drive file is not overwritten until you explicitly Save." })
        ] }),
        (validationError || error) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200", children: validationError || error })
      ] })
    }
  );
}
function PortfolioTotals({ metrics, requiredCashReserve, currency }) {
  const totals = [
    ["Net Worth", metrics.totalNetWorth],
    ["Total Assets", metrics.totalAssets],
    ["Liabilities", metrics.totalLiabilities],
    ["Investable Assets", metrics.investableAssets],
    ["Financial Portfolio", metrics.financialPortfolio],
    ["Required Cash Reserve", requiredCashReserve]
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { "aria-labelledby": "portfolio-totals-title", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { id: "portfolio-totals-title", className: "mb-3 text-sm font-medium text-zinc-300", children: "Portfolio totals" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", children: totals.map(([label, value]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900/40 p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-lg font-medium", children: formatCurrency(value, currency) })
    ] }, label)) })
  ] });
}
function PortfolioViewSelector({ value, onChange, title, description }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex overflow-hidden rounded-lg border border-zinc-700 text-sm", role: "group", "aria-label": title, children: Object.entries(portfolioViews).map(([key, view]) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: () => onChange(key),
        "aria-pressed": value === key,
        className: `px-3 py-2 ${value === key ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"}`,
        children: view.name
      },
      key
    )) })
  ] });
}
function Section({ title, children, right }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-zinc-200 font-medium", children: title }),
      right
    ] }),
    children
  ] });
}
function hasSnapshotMonthConflict(snapshots, editingIndex, month) {
  return snapshots.some((snapshot, index) => index !== editingIndex && snapshot.asOf.slice(0, 7) === month);
}
function SnapshotTabs({
  snapshots,
  currentIndex,
  onSelect,
  onAdd,
  onChangeDate,
  onDelete,
  onRestore
}) {
  const [editIndex, setEditIndex] = reactExports.useState(null);
  const [editValue, setEditValue] = reactExports.useState("");
  const [original, setOriginal] = reactExports.useState(null);
  const [deleteIndex, setDeleteIndex] = reactExports.useState(null);
  const [undo, setUndo] = reactExports.useState(null);
  const fmt = (date) => date.toLocaleString("default", { month: "short", year: "numeric" });
  const currentMonth = (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
  const hasCurrent = snapshots.some((snapshot) => snapshot.asOf.slice(0, 7) === currentMonth);
  function startEdit(index) {
    const snapshot = snapshots[index];
    if (!snapshot) return;
    const next = {
      month: new Date(snapshot.asOf).toISOString().slice(0, 7)
    };
    setEditValue(next.month);
    setOriginal(next);
    setEditIndex(index);
  }
  const duplicateMonth = editIndex != null && hasSnapshotMonthConflict(snapshots, editIndex, editValue);
  const dirty = original && editValue !== original.month;
  function save(event) {
    event.preventDefault();
    if (!editValue || duplicateMonth) return;
    const [year, month] = editValue.split("-");
    onChangeDate(editIndex, new Date(Number(year), Number(month) - 1, 1));
    setEditIndex(null);
  }
  function confirmDelete() {
    const index = deleteIndex;
    const snapshot = snapshots[index];
    if (snapshot) setUndo({ snapshot, index });
    onDelete?.(index);
    setDeleteIndex(null);
    setEditIndex(null);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [
      snapshots.map((snapshot, index) => ({ snapshot, index })).sort((left, right) => new Date(left.snapshot.asOf) - new Date(right.snapshot.asOf)).map(({ snapshot, index }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onSelect(index),
          onDoubleClick: () => startEdit(index),
          className: `rounded-lg border px-3 py-1.5 ${index === currentIndex ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-700 bg-zinc-900 hover:bg-zinc-800"}`,
          title: "Double-click to edit check-in",
          children: fmt(new Date(snapshot.asOf))
        },
        snapshot.asOf
      )),
      !hasCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onAdd, className: "rounded-lg border border-dashed border-blue-600 bg-blue-950/20 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-950/40", children: "＋ New check-in" }),
      snapshots[currentIndex] && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => startEdit(currentIndex), className: "ml-auto rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm hover:bg-zinc-700", children: "Edit selected check-in" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between text-xs text-zinc-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "One check-in is allowed per calendar month." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: currentIndex === snapshots.length - 1 ? "Latest check-in · editable" : "Historical check-in · read-only" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        open: editIndex !== null,
        title: "Edit check-in",
        description: "Change the month represented by this state snapshot.",
        onClose: () => setEditIndex(null),
        dirty: !!dirty,
        onSubmit: save,
        size: "max-w-lg",
        deleteAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteIndex(editIndex), className: "rounded-lg bg-red-700 px-4 py-2 text-sm hover:bg-red-600", children: "🗑️ Delete check-in" }),
        primaryAction: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: !editValue || duplicateMonth, className: "rounded-lg bg-blue-600 px-4 py-2 text-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40", children: "Save check-in" }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { autoFocus: true, label: "Month", type: "month", value: editValue, onChange: setEditValue, error: duplicateMonth ? "A check-in already exists for this month." : "", required: true })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: deleteIndex !== null, title: "Delete check-in?", message: deleteIndex == null ? "" : `Delete the ${fmt(new Date(snapshots[deleteIndex]?.asOf))} check-in and its recorded portfolio history?`, onConfirm: confirmDelete, onCancel: () => setDeleteIndex(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: undo ? "Check-in deleted." : "", onUndo: () => {
      if (!undo) return;
      onRestore?.(undo.snapshot, undo.index);
      setUndo(null);
    }, onDismiss: () => setUndo(null) })
  ] });
}
const lines = [
  { key: "totalAssets", label: "Total Assets", color: "#8ab4f8" },
  { key: "investableAssets", label: "Investable Assets", color: "#34a853" },
  { key: "financialPortfolio", label: "Financial Portfolio", color: "#fbbc04" }
];
function ScopeHistoryChart({ data, currency = "EUR" }) {
  const canvasRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return void 0;
    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const padding = 38 * dpr;
      if (!data.length) {
        context.fillStyle = "#9aa0a6";
        context.font = `${14 * dpr}px ui-sans-serif`;
        context.fillText("No data", 12 * dpr, 20 * dpr);
        return;
      }
      const maxValue = Math.max(1, ...data.flatMap((point) => lines.map((line) => Number(point[line.key]) || 0)));
      const x = (index) => padding + index / Math.max(1, data.length - 1) * (width - 2 * padding);
      const y = (value) => height - padding - (Number(value) || 0) / maxValue * (height - 2 * padding);
      context.strokeStyle = "#3a3a3a";
      context.fillStyle = "#e8eaed";
      context.font = `${10 * dpr}px ui-sans-serif`;
      context.textAlign = "right";
      context.textBaseline = "middle";
      for (let index = 0; index <= 5; index += 1) {
        const value = maxValue / 5 * index;
        const py = y(value);
        context.beginPath();
        context.moveTo(padding, py);
        context.lineTo(width - padding, py);
        context.stroke();
        context.fillText(formatCurrency(value, currency), padding - 8 * dpr, py);
      }
      const tickCount = Math.min(data.length, 6);
      context.textAlign = "center";
      context.textBaseline = "top";
      for (let index = 0; index < tickCount; index += 1) {
        const pointIndex = Math.round(index / Math.max(1, tickCount - 1) * (data.length - 1));
        context.fillText(new Date(data[pointIndex].label).toLocaleDateString(), x(pointIndex), height - padding + 7 * dpr);
      }
      for (const line of lines) {
        context.beginPath();
        data.forEach((point, index) => {
          const px = x(index);
          const py = y(point[line.key]);
          if (index === 0) context.moveTo(px, py);
          else context.lineTo(px, py);
        });
        context.strokeStyle = line.color;
        context.lineWidth = 2 * dpr;
        context.stroke();
      }
    }
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, currency]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: canvasRef, className: "w-full h-64 rounded border border-zinc-800 bg-zinc-900" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-4 text-xs", children: lines.map((line) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block h-3 w-3 rounded", style: { backgroundColor: line.color } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: line.label })
    ] }, line.key)) })
  ] });
}
function StackedAreaChart({ data, assetTypes, currency = "EUR" }) {
  const canvasRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function draw() {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth * dpr;
      const height = canvas.clientHeight * dpr;
      canvas.width = width;
      canvas.height = height;
      ctx.clearRect(0, 0, width, height);
      const padding = 32 * dpr;
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();
      if (!data.length) {
        ctx.fillStyle = "#9aa0a6";
        ctx.font = `${14 * dpr}px ui-sans-serif`;
        ctx.fillText("No data", 12 * dpr, 20 * dpr);
        return;
      }
      const categories2 = Array.from(
        new Set(
          data.flatMap(
            (d) => Object.keys(d).filter(
              (k) => k !== "label" && k !== "value" && (Number(d[k]) || 0) > 0
            )
          )
        )
      );
      const xs = data.map((_, i) => i);
      const totals = data.map((d) => categories2.reduce((sum, category) => sum + (Number(d[category]) || 0), 0));
      const maxY = Math.max(...totals, 0);
      const xToPx = (x) => padding + x / Math.max(1, xs.length - 1) * (width - 2 * padding);
      const yToPx = (y) => height - padding - y / Math.max(1, maxY) * (height - 2 * padding);
      const yTickCount = 5;
      for (let i = 0; i <= yTickCount; i++) {
        const val = maxY / yTickCount * i;
        const py = yToPx(val);
        ctx.strokeStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
        ctx.stroke();
      }
      ctx.strokeStyle = "#2a2a2a";
      ctx.font = `${10 * dpr}px ui-sans-serif`;
      ctx.fillStyle = "#e8eaed";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      for (let i = 0; i <= yTickCount; i++) {
        const val = maxY / yTickCount * i;
        const py = yToPx(val);
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(padding - 4 * dpr, py);
        ctx.stroke();
        ctx.fillText(formatCurrency(val, currency), padding - 8 * dpr, py);
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const maxXTicks = Math.min(xs.length, 6);
      for (let i = 0; i < maxXTicks; i++) {
        const idx = Math.round(
          i / Math.max(1, maxXTicks - 1) * (xs.length - 1)
        );
        const px = xToPx(xs[idx]);
        ctx.beginPath();
        ctx.moveTo(px, height - padding);
        ctx.lineTo(px, height - padding + 4 * dpr);
        ctx.stroke();
        const dateLabel = new Date(data[idx].label).toLocaleDateString();
        ctx.fillText(dateLabel, px, height - padding + 6 * dpr);
      }
      const accum = new Array(xs.length).fill(0);
      categories2.forEach((cat) => {
        const vals = data.map((d) => Math.max(0, Number(d[cat]) || 0));
        const base = accum.slice();
        ctx.beginPath();
        ctx.moveTo(xToPx(xs[0]), yToPx(base[0] + vals[0]));
        for (let i = 1; i < xs.length; i++) {
          ctx.lineTo(xToPx(xs[i]), yToPx(base[i] + vals[i]));
        }
        for (let i = xs.length - 1; i >= 0; i--) {
          ctx.lineTo(xToPx(xs[i]), yToPx(base[i]));
        }
        ctx.closePath();
        ctx.fillStyle = colorForCategory(cat);
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
        for (let i = 0; i < xs.length; i++) {
          accum[i] = base[i] + vals[i];
        }
      });
    }
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [data, currency]);
  const categories = reactExports.useMemo(
    () => Array.from(
      new Set(
        data.flatMap(
          (d) => Object.keys(d).filter(
            (k) => k !== "label" && k !== "value" && (Number(d[k]) || 0) > 0
          )
        )
      )
    ),
    [data]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "canvas",
      {
        ref: canvasRef,
        className: "w-full h-64 rounded border border-zinc-800 bg-zinc-900"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 flex flex-wrap gap-2 text-xs", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "span",
        {
          className: "inline-block h-3 w-3 rounded",
          style: { backgroundColor: colorForCategory(c) }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: labelFor(c, assetTypes) })
    ] }, c)) })
  ] });
}
function strategyEffects(assets, recommendation, strategy, assetTypes, dimensions) {
  const effects = [];
  for (const [key, policy] of Object.entries(strategy.dimensionPolicies || {})) {
    if (policy.mode !== "target" && policy.mode !== "limits") continue;
    const current = concentrationRows(assets, key, policy, assetTypes, dimensions, recommendation.currentValues, "financial");
    const projected = concentrationRows(assets, key, policy, assetTypes, dimensions, recommendation.projectedValues, "financial");
    const projectedMap = new Map(projected.map((row) => [row.category, row]));
    for (const row of current) {
      const next = projectedMap.get(row.category);
      if (!next || Math.abs(next.current - row.current) < 0.01) continue;
      effects.push({
        key: `${key}:${row.category}`,
        dimension: dimensionName(key, dimensions),
        category: row.label,
        current: row.current,
        projected: next.current,
        target: row.target,
        min: row.min,
        max: row.max
      });
    }
  }
  return effects;
}
function SurplusPlan({ recommendation, assets, strategy, assetTypes, dimensions, currency }) {
  const effects = strategyEffects(assets, recommendation, strategy, assetTypes, dimensions);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: "Checking-account cash" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-medium", children: formatCurrency(recommendation.checkingCash, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: "Required cash reserve" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-medium", children: formatCurrency(recommendation.effectiveReserveTarget, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${recommendation.reserveShortfall > 0.01 ? "border-amber-800 bg-amber-950/20" : "border-zinc-800"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: "Reserve shortfall" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-lg font-medium ${recommendation.reserveShortfall > 0.01 ? "text-amber-300" : ""}`, children: formatCurrency(recommendation.reserveShortfall, currency) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${recommendation.availableToInvest > 0.01 ? "border-blue-700 bg-blue-950/20" : "border-zinc-800"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: "Investment cash available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-lg font-medium", children: formatCurrency(recommendation.availableToInvest, currency) })
      ] })
    ] }),
    (recommendation.warnings || []).map((warning) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-300", children: warning }, warning)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: recommendation.reason }),
    recommendation.accountReserves.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-medium", children: "Checking-account reserves" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "Account" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "Assignment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "Current" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "Reserve to keep" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "After transfers" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recommendation.accountReserves.map((account) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: account.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-zinc-400", children: account.assignment }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: formatCurrency(account.current, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: formatCurrency(account.reserve, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `py-2 text-right ${account.projected + 0.01 < account.reserve ? "text-amber-300" : ""}`, children: formatCurrency(account.projected, currency) })
        ] }, account.assetId)) })
      ] }) })
    ] }),
    recommendation.transfers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-sm font-medium", children: "Cash transfers — do these first" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "From" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "To" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-left", children: "Purpose" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "py-2 text-right", children: "Transfer" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recommendation.transfers.map((transfer, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: transfer.fromName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: transfer.toName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-zinc-400", children: transfer.kind === "replenish" ? "Replenish reserve" : "Fund investment cash" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right font-medium text-blue-300", children: formatCurrency(transfer.amount, currency) })
        ] }, `${transfer.fromAssetId}:${transfer.toAssetId}:${transfer.kind}:${index}`)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-zinc-800 p-3 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-zinc-500", children: "Financial Portfolio after plan" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        formatCurrency(recommendation.currentMetrics.financialPortfolio, currency),
        " → ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-300", children: formatCurrency(recommendation.projectedMetrics.financialPortfolio, currency) })
      ] })
    ] }),
    recommendation.unallocated > 0.01 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-800 bg-blue-950/20 p-3 text-sm text-blue-200", children: [
      formatCurrency(recommendation.unallocated, currency),
      " remains in the investment cash account. Guidance retains cash whenever no eligible purchase would improve the configured strategy."
    ] }),
    recommendation.plan.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Next investment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-400", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2", children: "Investment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Current" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Invest" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2", children: "Projected" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: recommendation.plan.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: item.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: formatCurrency(recommendation.currentValues[item.assetId] || 0, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right font-medium text-blue-300", children: formatCurrency(item.amount, currency) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: formatCurrency(recommendation.projectedValues[item.assetId] || 0, currency) })
        ] }, item.assetId)) })
      ] }) })
    ] }),
    effects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium mb-2", children: "Projected strategy effect" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto max-h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-zinc-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1", children: "Dimension" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1", children: "Current" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1", children: "Projected" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1", children: "Target / limit" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: effects.map((effect) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-zinc-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: effect.dimension }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: effect.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1 text-right", children: [
            effect.current.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-1 text-right", children: [
            effect.projected.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right", children: effect.target != null ? `${effect.target}%` : `${effect.min ?? "—"}%–${effect.max ?? "—"}%` })
        ] }, effect.key)) })
      ] }) })
    ] }),
    (recommendation.unresolvedRules || []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-800 bg-amber-950/20 p-3 text-sm text-amber-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        recommendation.unresolvedRules.length,
        " configured strategy ",
        recommendation.unresolvedRules.length === 1 ? "rule remains" : "rules remain",
        " outside target tolerance or limits after this buy-only plan. Existing positions, eligible destinations, or conflicting rules may prevent full compliance."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1 text-xs text-amber-100", children: recommendation.unresolvedRules.map((rule) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
        dimensionName(rule.key, dimensions),
        " · ",
        rule.label,
        ": ",
        rule.status,
        " at ",
        rule.current.toFixed(1),
        "% (",
        rule.target != null ? `target ${rule.target}%` : [rule.min != null ? `minimum ${rule.min}%` : "", rule.max != null ? `maximum ${rule.max}%` : ""].filter(Boolean).join(", "),
        ")"
      ] }, `${rule.key}:${rule.category}`)) })
    ] }),
    (recommendation.transfers.length > 0 || recommendation.plan.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500", children: "Advisory only. After executing the transfers and purchases, record the resulting balances and holdings in the next portfolio update." })
  ] });
}
const DB_NAME = "portfolio-tracker-db";
const STORE = "handles";
function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const MAGIC = new TextEncoder().encode("PTv1.enc");
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]);
  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 15e4, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
function concatBytes(...parts) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}
async function encryptJson(obj, password) {
  const plaintext = new TextEncoder().encode(JSON.stringify(obj, null, 2));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  const payload = concatBytes(new Uint8Array(MAGIC), salt, iv, ciphertext);
  return payload;
}
async function decryptJson(buf, password) {
  const data = new Uint8Array(buf);
  const magic = data.slice(0, 8);
  if (!equalBytes(magic, MAGIC)) throw new Error("Invalid file format");
  const salt = data.slice(8, 24);
  const iv = data.slice(24, 36);
  const ciphertext = data.slice(36);
  const key = await deriveKey(password, salt);
  const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
  const json = new TextDecoder().decode(new Uint8Array(plaintext));
  return JSON.parse(json);
}
function equalBytes(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
async function encryptPortfolio(data, password) {
  return await encryptJson(data, password);
}
async function decryptPortfolio(buf, password) {
  return await decryptJson(buf, password);
}
async function createPortfolioBackup(data, format, password = "") {
  if (format === "encrypted") {
    if (!password) throw new Error("Enter a password for the encrypted backup.");
    return {
      contents: await encryptJson(data, password),
      mimeType: "application/octet-stream",
      extension: "enc"
    };
  }
  if (format === "json") {
    return {
      contents: JSON.stringify(data, null, 2),
      mimeType: "application/json",
      extension: "json"
    };
  }
  throw new Error("Unsupported backup format.");
}
async function readPortfolioBackup(file, password = "") {
  if (!file?.arrayBuffer) throw new Error("Select a portfolio backup file.");
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const encrypted = equalBytes(bytes.slice(0, MAGIC.length), MAGIC);
  let data;
  if (encrypted) {
    if (!password) throw new Error("Enter the password for this encrypted backup.");
    try {
      data = await decryptJson(buffer, password);
    } catch {
      throw new Error("Could not decrypt the backup. Check the password and selected file.");
    }
  } else {
    try {
      const text = new TextDecoder().decode(bytes).replace(/^\uFEFF/, "");
      data = JSON.parse(text);
    } catch {
      throw new Error("The selected file is not a valid portfolio JSON backup.");
    }
  }
  return upgradePortfolio(data);
}
const DEFAULT_PORTFOLIO = {
  version: 10,
  currency: "EUR",
  assetTypes: cloneDefaults(defaultAssetTypes),
  liabilityTypes: cloneDefaults(defaultLiabilityTypes),
  dimensions: cloneDefaults(defaultDimensions),
  strategy: cloneDefaults(defaultStrategy),
  snapshots: []
};
function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function recordArray(value) {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}
function convertLegacySnapshotToV1(data) {
  if (!isRecord(data) || !data.asOf || !Array.isArray(data.assets)) return data;
  const { asOf, assets, allocation, assetTypes, currency, ...rest } = data;
  const inferredCurrency = currency || assets.find((asset) => isRecord(asset) && asset.currency)?.currency || DEFAULT_PORTFOLIO.currency;
  return {
    ...rest,
    version: 1,
    currency: inferredCurrency,
    assetTypes: isRecord(assetTypes) ? assetTypes : {},
    allocation: isRecord(allocation) ? allocation : {},
    snapshots: [{ asOf, assets, liabilities: [] }]
  };
}
function stableRecordIds(snapshots, kind) {
  const known = /* @__PURE__ */ new Map();
  const canonicalById = /* @__PURE__ */ new Map();
  let counter = 0;
  return recordArray(snapshots).map((snapshot) => {
    const occurrences = /* @__PURE__ */ new Map();
    const records = recordArray(snapshot[kind]).map((record) => {
      const fingerprint = `${record.type || ""}\0${record.name || ""}\0${record.description || ""}`;
      const occurrence = occurrences.get(fingerprint) || 0;
      occurrences.set(fingerprint, occurrence + 1);
      const lookup = `${fingerprint}\0${occurrence}`;
      let id = record.id && canonicalById.get(record.id) || known.get(lookup) || record.id;
      if (!id) {
        counter += 1;
        id = `${kind === "assets" ? "asset" : "liability"}-${counter}`;
      }
      if (record.id) canonicalById.set(record.id, id);
      known.set(lookup, id);
      return { ...record, id };
    });
    return { ...snapshot, [kind]: records };
  });
}
function convertV5ToV6(data) {
  const legacyAssetTypes = isRecord(data.assetTypes) ? data.assetTypes : defaultAssetTypes;
  const assetTypes = Object.fromEntries(
    Object.entries(legacyAssetTypes).map(([key, definition]) => [
      key,
      {
        ...isRecord(definition) ? definition : {},
        name: definition?.name || definition?.label || key,
        dimensionRules: definition?.dimensionRules || {}
      }
    ])
  );
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
    ...snapshot,
    assets: (snapshot.assets || []).map((asset) => ({
      ...normalizeAsset(asset, assetTypes),
      status: asset.status || "active"
    })),
    liabilities: (snapshot.liabilities || []).map((liability) => ({
      ...liability,
      value: Number(liability.value) || 0
    }))
  }));
  const snapshotLiabilities = snapshots[snapshots.length - 1]?.liabilities || [];
  const latestLiabilities = snapshotLiabilities.length ? snapshotLiabilities : recordArray(data.liabilities);
  const { allocation: legacyAllocation, ...rest } = data;
  return {
    ...rest,
    version: 6,
    currency: data.currency || "EUR",
    assetTypes,
    liabilityTypes: data.liabilityTypes || cloneDefaults(defaultLiabilityTypes),
    dimensions: mergeDimensions(data.dimensions),
    strategy: mergeStrategy(data.strategy, legacyAllocation),
    liabilities: latestLiabilities,
    snapshots
  };
}
function assetTypesWithScopeRules(assetTypes = {}) {
  return Object.fromEntries(
    Object.entries(assetTypes).map(([key, definition]) => [
      key,
      {
        ...isRecord(definition) ? definition : {},
        name: definition?.name || definition?.label || key,
        scopeRule: definition?.scopeRule || cloneDefaults(defaultAssetTypes[key]?.scopeRule || { mode: "user", value: "" }),
        dimensionRules: definition?.dimensionRules || {}
      }
    ])
  );
}
function inferLegacyPortfolioScope(asset = {}) {
  if (asset.isCheckingAccount) return { portfolioScope: "investable", scopeNeedsReview: false };
  if (asset.type === "private_equity" || asset.type === "real_estate") {
    return { portfolioScope: "total", scopeNeedsReview: false };
  }
  if (asset.eligibleForInvestment !== false && (asset.type === "stock" || asset.type === "bond" || asset.type === "commodity")) {
    return { portfolioScope: "financial", scopeNeedsReview: false };
  }
  return { portfolioScope: "total", scopeNeedsReview: true };
}
function convertV6ToV7(data) {
  const assetTypes = assetTypesWithScopeRules(data.assetTypes || cloneDefaults(defaultAssetTypes));
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
    ...snapshot,
    assets: (snapshot.assets || []).map((asset) => ({
      ...normalizeStoredAsset({
        ...asset,
        ...inferLegacyPortfolioScope(asset)
      }, assetTypes),
      status: asset.status || "active"
    })),
    liabilities: (snapshot.liabilities || []).map((liability) => ({ ...liability }))
  }));
  const snapshotLiabilities = snapshots[snapshots.length - 1]?.liabilities || [];
  const latestLiabilities = snapshotLiabilities.length ? snapshotLiabilities : recordArray(data.liabilities);
  return {
    ...data,
    version: 7,
    currency: data.currency || "EUR",
    assetTypes,
    liabilityTypes: data.liabilityTypes || cloneDefaults(defaultLiabilityTypes),
    dimensions: mergeDimensions(data.dimensions),
    strategy: mergeStrategy(data.strategy),
    liabilities: latestLiabilities,
    snapshots
  };
}
function normalizeLiability(liability = {}, liabilityTypes = defaultLiabilityTypes) {
  const type = liability.type || Object.keys(liabilityTypes)[0] || "loan";
  return {
    id: liability.id || "",
    name: liability.name || liabilityTypes[type]?.name || type,
    type,
    description: liability.description || "",
    value: Number(liability.value) || 0
  };
}
function normalizePortfolio(data, version2) {
  const assetTypes = assetTypesWithScopeRules(data.assetTypes || cloneDefaults(defaultAssetTypes));
  const liabilityTypes = Object.fromEntries(
    Object.entries(isRecord(data.liabilityTypes) ? data.liabilityTypes : cloneDefaults(defaultLiabilityTypes)).map(([key, definition]) => [
      key,
      { ...isRecord(definition) ? definition : {}, name: definition?.name || definition?.label || key }
    ])
  );
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => {
    let investmentCashAssigned = false;
    return {
      asOf: snapshot.asOf,
      assets: (snapshot.assets || []).map((asset) => {
        const normalized = normalizeStoredAsset({
          ...asset,
          portfolioScope: validPortfolioScope(asset.portfolioScope) ? asset.portfolioScope : "total",
          scopeNeedsReview: !!asset.scopeNeedsReview
        }, assetTypes);
        if (version2 < 10) {
          delete normalized.reserveToKeep;
          delete normalized.isInvestmentCashAccount;
        } else if (normalized.isInvestmentCashAccount) {
          if (investmentCashAssigned) normalized.isInvestmentCashAccount = false;
          else investmentCashAssigned = true;
        }
        return normalized;
      }),
      liabilities: (snapshot.liabilities || []).map((liability) => normalizeLiability(liability, liabilityTypes))
    };
  });
  return {
    version: version2,
    currency: data.currency || "EUR",
    assetTypes,
    liabilityTypes,
    dimensions: isRecord(data.dimensions) ? data.dimensions : cloneDefaults(defaultDimensions),
    strategy: mergeStrategy(isRecord(data.strategy) ? data.strategy : {}),
    snapshots
  };
}
function normalizeV8Portfolio(data) {
  return normalizePortfolio(data, 8);
}
function normalizeV9Portfolio(data) {
  return normalizePortfolio(data, 9);
}
function normalizeV10Portfolio(data) {
  return normalizePortfolio(data, 10);
}
function convertV7ToV8(data) {
  let snapshots = stableRecordIds(data.snapshots || [], "assets");
  snapshots = stableRecordIds(snapshots, "liabilities").map((snapshot) => ({
    asOf: snapshot.asOf,
    assets: (snapshot.assets || []).filter((asset) => asset.status !== "closed" && asset.status !== "sold"),
    liabilities: snapshot.liabilities || []
  }));
  const legacyLiabilities = recordArray(data.liabilities);
  if (legacyLiabilities.length && !snapshots.some((snapshot) => snapshot.liabilities.length)) {
    if (snapshots.length) {
      snapshots[snapshots.length - 1] = { ...snapshots[snapshots.length - 1], liabilities: legacyLiabilities };
    } else {
      snapshots.push({ asOf: (/* @__PURE__ */ new Date()).toISOString(), assets: [], liabilities: legacyLiabilities });
    }
  }
  return normalizeV8Portfolio({ ...data, snapshots });
}
function convertV8ToV9(data) {
  const snapshots = recordArray(data.snapshots).map((snapshot) => ({
    ...snapshot,
    assets: recordArray(snapshot.assets).map((asset) => {
      const cleaned = { ...asset };
      delete cleaned.valuationDate;
      return cleaned;
    })
  }));
  return normalizeV9Portfolio({ ...data, snapshots });
}
function convertV9ToV10(data) {
  const snapshots = recordArray(data.snapshots).map((snapshot) => {
    const assets = recordArray(snapshot.assets);
    const markedDestinations = assets.filter((asset) => asset.isInvestmentCashAccount && asset.type === "cash" && asset.portfolioScope === "financial");
    const financialCash = assets.filter((asset) => asset.type === "cash" && asset.portfolioScope === "financial" && !asset.isCheckingAccount);
    const destination = markedDestinations.length === 1 ? markedDestinations[0] : markedDestinations.length === 0 && financialCash.length === 1 ? financialCash[0] : null;
    return {
      ...snapshot,
      assets: assets.map((asset) => ({
        ...asset,
        reserveToKeep: "",
        isInvestmentCashAccount: asset === destination
      }))
    };
  });
  return normalizeV10Portfolio({ ...data, snapshots });
}
function upgradePortfolio(data) {
  if (!isRecord(data)) throw new Error("Invalid portfolio contents.");
  let out = convertLegacySnapshotToV1(data);
  if (out.version == null && (Array.isArray(out.snapshots) || isRecord(out.assetTypes) || isRecord(out.allocation))) {
    out = { ...out, version: 1 };
  } else {
    out = { ...out };
  }
  const parsedVersion = Number(out.version);
  if (!Number.isInteger(parsedVersion) || parsedVersion < 1) {
    throw new Error("Unsupported portfolio file: missing or invalid version.");
  }
  if (parsedVersion > DEFAULT_PORTFOLIO.version) {
    throw new Error(`This portfolio uses newer file version ${parsedVersion}. Update the application to open it.`);
  }
  out.version = parsedVersion;
  if (out.version === 1) {
    out = { currency: "USD", ...out, version: 2 };
  }
  if (out.version === 2) {
    out = {
      ...out,
      liabilityTypes: defaultLiabilityTypes,
      snapshots: recordArray(out.snapshots).map((s) => ({ ...s, liabilities: recordArray(s.liabilities) })),
      version: 3
    };
  }
  if (out.version === 3) {
    out = { ...out, liabilities: out.liabilities || [], version: 4 };
  }
  if (out.version === 4) {
    out = { ...out, version: 5 };
  }
  if (out.version === 5) {
    out = convertV5ToV6(out);
  }
  if (out.version === 6) {
    out = convertV6ToV7(out);
  }
  if (out.version === 7) {
    out = convertV7ToV8(out);
  }
  if (out.version === 8) {
    out = convertV8ToV9(out);
  }
  if (out.version === 9) {
    out = convertV9ToV10(out);
  }
  if (out.version === 10) {
    out = normalizeV10Portfolio(out);
  }
  return out;
}
async function openExistingFile() {
  const [handle] = await window.showOpenFilePicker({
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }]
  });
  await idbSet("fileHandle", handle);
  return handle;
}
async function createNewFile() {
  const handle = await window.showSaveFilePicker({
    suggestedName: "portfolio.enc",
    types: [{ description: "Portfolio", accept: { "application/octet-stream": [".enc"] } }]
  });
  await idbSet("fileHandle", handle);
  const writable = await handle.createWritable();
  await writable.close();
  return handle;
}
async function getSavedFile() {
  const handle = await idbGet("fileHandle");
  return handle;
}
async function clearSavedFile() {
  await idbSet("fileHandle", null);
}
async function readPortfolioFile(handle, password) {
  const file = await handle.getFile();
  if (file.size === 0) return DEFAULT_PORTFOLIO;
  const buf = await file.arrayBuffer();
  const data = await decryptJson(buf, password);
  return upgradePortfolio(data);
}
async function writePortfolioFile(handle, password, data) {
  const payload = await encryptJson(data, password);
  const writable = await handle.createWritable();
  await writable.write(payload);
  await writable.close();
}
let tokenClient;
let driveReady = false;
const DRIVE_FILENAME_KEY = "driveFilename";
function initDrive({ apiKey, clientId }) {
  return new Promise((resolve) => {
    if (!globalThis.gapi?.load || !globalThis.google?.accounts?.oauth2) {
      console.error("Failed to initialize Google Drive: Google API scripts are unavailable");
      tokenClient = void 0;
      driveReady = false;
      resolve(false);
      return;
    }
    try {
      gapi.load("client", async () => {
        try {
          await gapi.client.init({
            apiKey,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]
          });
          const url = new URL(window.location.href);
          const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));
          const searchParams = url.searchParams;
          const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
          const code = searchParams.get("code") || hashParams.get("code");
          if (accessToken || code) {
            gapi.client.setToken(
              accessToken ? { access_token: accessToken } : { code }
            );
            url.hash = "";
            url.search = "";
            window.history.replaceState({}, "", url.toString());
          }
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "https://www.googleapis.com/auth/drive.file",
            callback: () => {
            },
            ux_mode: "redirect",
            redirect_uri: window.location.origin
          });
          driveReady = true;
        } catch (err) {
          console.error("Failed to initialize Google Drive", err);
          tokenClient = void 0;
          driveReady = false;
        }
        resolve(driveReady);
      });
    } catch (err) {
      console.error("Failed to initialize Google Drive", err);
      tokenClient = void 0;
      driveReady = false;
      resolve(false);
    }
  });
}
function ensureToken() {
  const token = gapi.client.getToken();
  if (token?.access_token) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    tokenClient.callback = () => resolve();
    tokenClient.requestAccessToken({ prompt: "" });
  });
}
async function openDriveFile(password) {
  if (!driveReady || !gapi?.client?.getToken || !tokenClient) return;
  try {
    await ensureToken();
  } catch (err) {
    throw new Error("Failed to authorize with Google Drive");
  }
  const defaultName = localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc";
  const name = prompt("Enter Google Drive filename", defaultName);
  if (!name) return;
  localStorage.setItem(DRIVE_FILENAME_KEY, name);
  try {
    const res = await gapi.client.drive.files.list({
      q: `name='${name.replace(/['\\]/g, "\\$&")}' and trashed=false`,
      pageSize: 1,
      fields: "files(id)"
    });
    const files = res?.result?.files || [];
    if (files.length === 0) {
      if (confirm("File not found. Create it?")) {
        try {
          const id = await writeDrivePortfolioFile(void 0, password, DEFAULT_PORTFOLIO);
          return id;
        } catch (err) {
          throw new Error("Failed to create Google Drive file");
        }
      }
      return;
    }
    return files[0].id;
  } catch (err) {
    throw new Error("Failed to search Google Drive for file");
  }
}
async function readDrivePortfolioFile(fileId, password) {
  if (!driveReady || !tokenClient) return;
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: "Bearer " + token }
  });
  const buf = await res.arrayBuffer();
  if (buf.byteLength === 0) return DEFAULT_PORTFOLIO;
  return upgradePortfolio(await decryptPortfolio(buf, password));
}
async function writeDrivePortfolioFile(fileId, password, data) {
  if (!driveReady || !tokenClient) return;
  await ensureToken();
  const token = gapi.client.getToken().access_token;
  const payload = await encryptPortfolio(data, password);
  const metadata = { name: localStorage.getItem(DRIVE_FILENAME_KEY) || "portfolio.enc" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([payload], { type: "application/octet-stream" }));
  const method = fileId ? "PATCH" : "POST";
  const url = fileId ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart` : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  const res = await fetch(url, {
    method,
    headers: { Authorization: "Bearer " + token },
    body: form
  });
  const json = await res.json();
  return json.id;
}
function withExclusiveInvestmentCash(nextAssets, selected) {
  if (!selected?.isInvestmentCashAccount) return nextAssets;
  return nextAssets.map((asset) => asset.id === selected.id ? asset : { ...asset, isInvestmentCashAccount: false });
}
function useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset }) {
  const [assetToDelete, setAssetToDelete] = reactExports.useState(null);
  const [deletedAsset, setDeletedAsset] = reactExports.useState(null);
  function addAsset(input) {
    const base = mkAsset(input.type, assetTypes, input.name);
    const asset = normalizeAsset({ ...base, ...input, id: base.id }, assetTypes);
    setAssetsAndUpdateSnapshot(withExclusiveInvestmentCash([...assets, asset], asset));
  }
  function updateAsset(updated) {
    setAssetsAndUpdateSnapshot(withExclusiveInvestmentCash(assets.map((a) => a.id === updated.id ? updated : a), updated));
  }
  function requestDeleteAsset(asset) {
    if (!asset) return;
    if (setEditAsset) setEditAsset(null);
    setAssetToDelete(asset);
  }
  function confirmDeleteAsset() {
    if (assetToDelete) {
      setDeletedAsset({ asset: assetToDelete, index: assets.findIndex((asset) => asset.id === assetToDelete.id) });
      setAssetsAndUpdateSnapshot(assets.filter((x) => x.id !== assetToDelete.id));
      setAssetToDelete(null);
    }
  }
  function undoDeleteAsset() {
    if (!deletedAsset) return;
    const next = [...assets];
    next.splice(Math.max(0, Math.min(deletedAsset.index, next.length)), 0, deletedAsset.asset);
    setAssetsAndUpdateSnapshot(next);
    setDeletedAsset(null);
  }
  function cancelDeleteAsset() {
    setAssetToDelete(null);
  }
  return {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset,
    deletedAsset,
    undoDeleteAsset,
    clearDeletedAsset: () => setDeletedAsset(null)
  };
}
function useLiabilityManager({ assets, liabilities, liabilityTypes, setAssetsAndUpdateSnapshot, setEditLiability }) {
  const [liabilityToDelete, setLiabilityToDelete] = reactExports.useState(null);
  const [deletedLiability, setDeletedLiability] = reactExports.useState(null);
  function addLiability({ name, type, description, value }) {
    const liability = { id: mkId(), name, type, description, value };
    setAssetsAndUpdateSnapshot(assets, [...liabilities, liability]);
  }
  function updateLiability(updated) {
    setAssetsAndUpdateSnapshot(
      assets,
      liabilities.map((l) => l.id === updated.id ? updated : l)
    );
  }
  function requestDeleteLiability(liability) {
    if (!liability) return;
    if (setEditLiability) setEditLiability(null);
    setLiabilityToDelete(liability);
  }
  function confirmDeleteLiability() {
    if (liabilityToDelete) {
      setDeletedLiability({ liability: liabilityToDelete, index: liabilities.findIndex((liability) => liability.id === liabilityToDelete.id) });
      setAssetsAndUpdateSnapshot(
        assets,
        liabilities.filter((x) => x.id !== liabilityToDelete.id)
      );
      setLiabilityToDelete(null);
    }
  }
  function undoDeleteLiability() {
    if (!deletedLiability) return;
    const next = [...liabilities];
    next.splice(Math.max(0, Math.min(deletedLiability.index, next.length)), 0, deletedLiability.liability);
    setAssetsAndUpdateSnapshot(assets, next);
    setDeletedLiability(null);
  }
  function cancelDeleteLiability() {
    setLiabilityToDelete(null);
  }
  return {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
    deletedLiability,
    undoDeleteLiability,
    clearDeletedLiability: () => setDeletedLiability(null)
  };
}
function usePortfolioFile({
  assets,
  setAssets,
  liabilities,
  setLiabilities,
  assetTypes,
  setAssetTypes,
  liabilityTypes,
  setLiabilityTypes,
  currency,
  setCurrency,
  dimensions,
  setDimensions,
  strategy,
  setStrategy,
  snapshots,
  setSnapshots,
  snapshotFromAssets,
  setCurrentIndex
}) {
  const [password, setPassword] = reactExports.useState("");
  const [fileHandle, setFileHandle] = reactExports.useState(null);
  const [driveFileId, setDriveFileId] = reactExports.useState(null);
  const [step, setStep] = reactExports.useState("pick");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [dirty, setDirty] = reactExports.useState(false);
  const [lastSavedAt, setLastSavedAt] = reactExports.useState(null);
  const skipDirty = reactExports.useRef(true);
  reactExports.useEffect(() => {
    (async () => {
      try {
        const saved = await getSavedFile();
        if (saved && saved.queryPermission) {
          const perm = await saved.queryPermission({ mode: "readwrite" });
          if (perm === "granted" || perm === "prompt") {
            setFileHandle(saved);
            setStep("password");
          } else {
            await clearSavedFile();
          }
        }
      } catch (e) {
        console.warn("No saved handle", e);
      }
    })();
  }, []);
  reactExports.useEffect(() => {
    if (skipDirty.current) {
      skipDirty.current = false;
      return;
    }
    setDirty(true);
  }, [assetTypes, liabilityTypes, currency, dimensions, strategy, snapshots]);
  reactExports.useEffect(() => {
    function beforeUnload(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  async function handleOpenExisting() {
    try {
      const h = await openExistingFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }
  async function handleCreateNew() {
    try {
      const h = await createNewFile();
      setFileHandle(h);
      setStep("password");
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    }
  }
  function handleOpenDrive() {
    setDriveFileId("");
    setFileHandle(null);
    setStep("password");
  }
  async function handleOpenSample() {
    setLoading(true);
    setError(null);
    try {
      const examples = [
        { type: "cash", name: "Main checking account", value: 25e3, reserveToKeep: 6e3 },
        { type: "cash", name: "Household checking account", value: 5e3, reserveToKeep: "" },
        { type: "cash", name: "Investment cash", value: 1e3, portfolioScope: "financial", isInvestmentCashAccount: true },
        { type: "stock", name: "Global equity ETF", value: 6e4 },
        { type: "bond", name: "Government bond ETF", value: 2e4 },
        { type: "real_estate", name: "Rental property", value: 1e5 },
        { type: "commodity", name: "Gold ETC", value: 1e4 }
      ];
      const sampleAssets = examples.map(({ type, name, value, ...overrides }) => {
        const a = mkAsset(type, defaultAssetTypes, name);
        a.value = value;
        a.eligibleForInvestment = type !== "cash" && type !== "real_estate";
        Object.assign(a, overrides);
        return normalizeAsset(a, defaultAssetTypes);
      });
      const sampleSnapshots = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const snapAssets = sampleAssets.map((a) => ({
          ...a,
          value: Math.round(a.value * (0.8 + Math.random() * 0.4))
        }));
        sampleSnapshots.push({ asOf: d.toISOString(), assets: snapAssets, liabilities: [] });
      }
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setCurrency("EUR");
      setDimensions(cloneDefaults(defaultDimensions));
      setStrategy(mergeStrategy({
        cashReserveTarget: 1e4,
        dimensionPolicies: {
          asset_type: {
            mode: "target",
            tolerance: 2,
            importance: 3,
            categories: {
              stock: { target: 65 },
              bond: { target: 25 },
              commodity: { target: 10 }
            }
          }
        }
      }));
      setSnapshots(sampleSnapshots);
      setAssets(sampleSnapshots[sampleSnapshots.length - 1].assets);
      setLiabilities([]);
      setCurrentIndex(sampleSnapshots.length - 1);
      setStep("main");
      setDirty(false);
      setLastSavedAt(null);
      skipDirty.current = true;
    } catch (e) {
      setError(e && e.message ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }
  function applyPortfolioData(data, { markDirty = false } = {}) {
    const snaps = (data.snapshots || []).slice().sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
    const at = data.assetTypes || defaultAssetTypes;
    const lt = data.liabilityTypes || defaultLiabilityTypes;
    setSnapshots(snaps);
    const latest = snaps[snaps.length - 1];
    if (latest) {
      setAssets((latest.assets || []).map((a) => normalizeStoredAsset({ ...a, id: a.id || mkId(), name: a.name || labelFor(a.type, at) }, at)));
      setLiabilities(
        (latest.liabilities || []).map((l) => ({
          ...l,
          id: l.id || mkId(),
          name: l.name || labelFor(l.type, lt)
        }))
      );
      setCurrentIndex(snaps.length - 1);
    } else {
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
    }
    setCurrency(data.currency || "EUR");
    setDimensions(data.dimensions || cloneDefaults(defaultDimensions));
    setStrategy(data.strategy || cloneDefaults(defaultStrategy));
    setAssetTypes(at);
    setLiabilityTypes(lt);
    setStep("main");
    setDirty(markDirty);
    setLastSavedAt(null);
    skipDirty.current = true;
  }
  async function handleLoad() {
    if (!fileHandle && driveFileId === null) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    setLoading(true);
    setError(null);
    try {
      let data;
      if (driveFileId !== null) {
        let id = driveFileId;
        if (!id) {
          id = await openDriveFile(password);
          if (!id) {
            setError("Select or create a Google Drive file.");
            return;
          }
          setDriveFileId(id);
        }
        data = await readDrivePortfolioFile(id, password);
      } else {
        const file = await fileHandle.getFile();
        const isEmpty = file.size === 0;
        data = await readPortfolioFile(fileHandle, password);
        if (isEmpty) {
          await writePortfolioFile(fileHandle, password, data);
        }
      }
      applyPortfolioData(data);
    } catch (e) {
      if (e && (e.name === "NotAllowedError" || e.name === "NotFoundError")) {
        await clearSavedFile();
        setFileHandle(null);
        setStep("pick");
        setError("Cannot access saved file. Please pick it again.");
      } else {
        setError(e && e.message ? e.message : String(e));
      }
    } finally {
      setLoading(false);
    }
  }
  function buildPortfolioData() {
    return {
      ...DEFAULT_PORTFOLIO,
      currency,
      assetTypes,
      liabilityTypes,
      dimensions,
      strategy,
      snapshots
    };
  }
  async function withLoading(fn, failureHint = "") {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const message = e && e.message ? e.message : String(e);
      setError(failureHint ? `${message} ${failureHint}` : message);
      return false;
    } finally {
      setLoading(false);
    }
  }
  async function handleSave() {
    if (!fileHandle && !driveFileId) return setError("Select a file first.");
    if (!password) return setError("Enter a password first.");
    return withLoading(async () => {
      const data = buildPortfolioData();
      if (driveFileId) {
        const id = await writeDrivePortfolioFile(driveFileId, password, data);
        setDriveFileId(id);
      } else {
        await writePortfolioFile(fileHandle, password, data);
      }
      setDirty(false);
      setLastSavedAt(/* @__PURE__ */ new Date());
    }, "Your changes are still in memory. Export a backup before closing or reloading the page.");
  }
  async function handleExportBackup(format, backupPassword) {
    return withLoading(async () => {
      const backup = await createPortfolioBackup(buildPortfolioData(), format, backupPassword);
      const blob = new Blob([backup.contents], { type: backup.mimeType });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `portfolio-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.${backup.extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      return true;
    });
  }
  async function handleImportBackup(file, backupPassword) {
    return withLoading(async () => {
      const data = await readPortfolioBackup(file, backupPassword);
      applyPortfolioData(data, { markDirty: true });
      return true;
    });
  }
  async function handleCloseFile({ save = false } = {}) {
    return withLoading(async () => {
      if (save) {
        if (!fileHandle && !driveFileId) throw new Error("This portfolio has no file to save to.");
        const data = buildPortfolioData();
        if (driveFileId) await writeDrivePortfolioFile(driveFileId, password, data);
        else await writePortfolioFile(fileHandle, password, data);
      }
      if (driveFileId) setDriveFileId(null);
      if (fileHandle) {
        await clearSavedFile();
        setFileHandle(null);
      }
      setDirty(false);
      setLastSavedAt(null);
      skipDirty.current = true;
      setPassword("");
      setSnapshots([]);
      setCurrentIndex(0);
      setAssets([]);
      setLiabilities([]);
      snapshotFromAssets([], []);
      setCurrency(DEFAULT_PORTFOLIO.currency);
      setDimensions(cloneDefaults(defaultDimensions));
      setStrategy(cloneDefaults(defaultStrategy));
      setAssetTypes(defaultAssetTypes);
      setLiabilityTypes(defaultLiabilityTypes);
      setStep("pick");
    }, save ? "Your changes are still in memory. Export a backup before closing or reloading the page." : "");
  }
  return {
    password,
    setPassword,
    fileHandle,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    lastSavedAt,
    canSave: Boolean(fileHandle || driveFileId),
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleExportBackup,
    handleImportBackup,
    handleCloseFile
  };
}
function useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes }) {
  const [snapshots, setSnapshots] = reactExports.useState([]);
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  function snapshotFromAssets(nextAssets = assets, nextLiabilities = liabilities, date = /* @__PURE__ */ new Date()) {
    setSnapshots((prev) => {
      const iso = date.toISOString();
      const month = iso.slice(0, 7);
      const snap = {
        asOf: iso,
        assets: (nextAssets || []).map((a) => ({ ...a, dimensions: JSON.parse(JSON.stringify(a.dimensions || {})) })),
        liabilities: (nextLiabilities || []).map((l) => ({ ...l }))
      };
      const existing = prev.findIndex((p) => p.asOf.slice(0, 7) === month);
      let s;
      if (existing >= 0) {
        s = prev.map((p, i) => i === existing ? snap : p);
        setCurrentIndex(existing);
      } else {
        s = [...prev, snap].sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
        setCurrentIndex(s.indexOf(snap));
      }
      return s;
    });
  }
  function setAssetsAndUpdateSnapshot(nextAssets, nextLiabilities = liabilities) {
    setAssets(nextAssets);
    setLiabilities(nextLiabilities);
    setSnapshots(
      (prev) => prev.map(
        (s, i) => i === currentIndex ? {
          ...s,
          assets: (nextAssets || []).map((a) => ({ ...a, dimensions: JSON.parse(JSON.stringify(a.dimensions || {})) })),
          liabilities: (nextLiabilities || []).map((l) => ({ ...l }))
        } : s
      )
    );
  }
  function handleSelectSnapshot(i) {
    const snap = snapshots[i];
    if (!snap) return;
    setCurrentIndex(i);
    setAssets((snap.assets || []).map((a) => ({
      ...a,
      dimensions: JSON.parse(JSON.stringify(a.dimensions || {})),
      name: a.name || labelFor(a.type, assetTypes)
    })));
    setLiabilities(
      (snap.liabilities || []).map((l) => ({
        ...l,
        name: l.name || labelFor(l.type, liabilityTypes)
      }))
    );
  }
  function handleAddSnapshot() {
    snapshotFromAssets(assets, liabilities);
  }
  function handleChangeSnapshotDate(i, date) {
    setSnapshots((prev) => {
      const iso = date.toISOString();
      const month = iso.slice(0, 7);
      if (prev.some((s, idx) => idx !== i && s.asOf.slice(0, 7) === month)) {
        return prev;
      }
      const next = prev.map((s, idx) => idx === i ? { ...s, asOf: iso } : s).sort((a, b) => new Date(a.asOf) - new Date(b.asOf));
      setCurrentIndex(next.findIndex((s) => s.asOf === iso));
      return next;
    });
  }
  function handleDeleteSnapshot(i) {
    setSnapshots((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      const nextIndex = Math.max(0, Math.min(i - 1, next.length - 1));
      setCurrentIndex(nextIndex);
      const selected = next[nextIndex];
      setAssets((selected?.assets || []).map((asset) => ({
        ...asset,
        dimensions: JSON.parse(JSON.stringify(asset.dimensions || {}))
      })));
      setLiabilities((selected?.liabilities || []).map((liability) => ({ ...liability })));
      return next;
    });
  }
  function handleRestoreSnapshot(snapshot, originalIndex) {
    if (!snapshot) return;
    setSnapshots((previous) => {
      if (previous.some((item) => item.asOf.slice(0, 7) === snapshot.asOf.slice(0, 7))) return previous;
      const next = [...previous];
      next.splice(Math.max(0, Math.min(originalIndex, next.length)), 0, snapshot);
      next.sort((left, right) => new Date(left.asOf) - new Date(right.asOf));
      const index = next.findIndex((item) => item.asOf === snapshot.asOf);
      setCurrentIndex(index);
      setAssets((snapshot.assets || []).map((asset) => ({ ...asset, dimensions: JSON.parse(JSON.stringify(asset.dimensions || {})) })));
      setLiabilities((snapshot.liabilities || []).map((liability) => ({ ...liability })));
      return next;
    });
  }
  return {
    snapshots,
    setSnapshots,
    currentIndex,
    setCurrentIndex,
    snapshotFromAssets,
    setAssetsAndUpdateSnapshot,
    handleSelectSnapshot,
    handleAddSnapshot,
    handleChangeSnapshotDate,
    handleDeleteSnapshot,
    handleRestoreSnapshot
  };
}
const version = "1.0.87";
const pkg = {
  version
};
const workflowSections = [
  { key: "update", label: "Update portfolio", description: "Record current holdings and liabilities." },
  { key: "analysis", label: "Analysis", description: "Review totals, allocation, history, and concentration." },
  { key: "guidance", label: "Guidance", description: "Review cash reserve and the next investment." }
];
function App() {
  const [assetTypes, setAssetTypes] = reactExports.useState(() => cloneDefaults(defaultAssetTypes));
  const [liabilityTypes, setLiabilityTypes] = reactExports.useState(() => cloneDefaults(defaultLiabilityTypes));
  const [currency, setCurrency] = reactExports.useState(DEFAULT_PORTFOLIO.currency);
  const [dimensions, setDimensions] = reactExports.useState(() => cloneDefaults(defaultDimensions));
  const [strategy, setStrategy] = reactExports.useState(() => cloneDefaults(defaultStrategy));
  const [assets, setAssets] = reactExports.useState([]);
  const [liabilities, setLiabilities] = reactExports.useState([]);
  const [period, setPeriod] = reactExports.useState("monthly");
  const [chartMode, setChartMode] = reactExports.useState("total");
  const [portfolioView, setPortfolioView] = reactExports.useState("total");
  const [visiblePortfolioScopes, setVisiblePortfolioScopes] = reactExports.useState(() => Object.keys(portfolioScopeOptions));
  const [mainSection, setMainSection] = reactExports.useState("update");
  const [selectedDimension, setSelectedDimension] = reactExports.useState("asset_type");
  const [configOpen, setConfigOpen] = reactExports.useState(false);
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [addLiabilityOpen, setAddLiabilityOpen] = reactExports.useState(false);
  const [editAsset, setEditAsset] = reactExports.useState(null);
  const [editLiability, setEditLiability] = reactExports.useState(null);
  const [showTarget, setShowTarget] = reactExports.useState(false);
  const [jsonOpen, setJsonOpen] = reactExports.useState(false);
  const [closePortfolioOpen, setClosePortfolioOpen] = reactExports.useState(false);
  const [backupModalMode, setBackupModalMode] = reactExports.useState(null);
  const driveApiKey = "AIzaSyD9IhFBHBHEs729edMO7LsoKZFlTfsnv5U";
  const driveClientId = "967365398072-sj6mjo1r3pdg18frmdl5aoafnvbbsfob.apps.googleusercontent.com";
  const driveConfigured = Boolean(driveClientId);
  const [driveAvailable, setDriveAvailable] = reactExports.useState(driveConfigured);
  const builtAgo = reactExports.useMemo(() => {
    const timestamp = "2026-08-13T21:20:04.050Z";
    const difference = Date.now() - new Date(timestamp).getTime();
    const formatter = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
    const seconds = Math.floor(difference / 1e3);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return formatter.format(-days, "day");
    if (hours > 0) return formatter.format(-hours, "hour");
    if (minutes > 0) return formatter.format(-minutes, "minute");
    return formatter.format(-seconds, "second");
  }, []);
  const {
    snapshots,
    setSnapshots,
    currentIndex,
    setCurrentIndex,
    snapshotFromAssets,
    setAssetsAndUpdateSnapshot,
    handleSelectSnapshot,
    handleAddSnapshot,
    handleChangeSnapshotDate,
    handleDeleteSnapshot,
    handleRestoreSnapshot
  } = useSnapshots({ assets, setAssets, liabilities, setLiabilities, assetTypes, liabilityTypes });
  const {
    password,
    setPassword,
    setFileHandle,
    step,
    setStep,
    loading,
    error,
    setError,
    dirty,
    lastSavedAt,
    canSave,
    handleOpenExisting,
    handleCreateNew,
    handleOpenDrive,
    handleOpenSample,
    handleLoad,
    handleSave,
    handleExportBackup,
    handleImportBackup,
    handleCloseFile
  } = usePortfolioFile({
    assets,
    setAssets,
    liabilities,
    setLiabilities,
    assetTypes,
    setAssetTypes,
    liabilityTypes,
    setLiabilityTypes,
    currency,
    setCurrency,
    dimensions,
    setDimensions,
    strategy,
    setStrategy,
    snapshots,
    setSnapshots,
    snapshotFromAssets,
    setCurrentIndex
  });
  reactExports.useEffect(() => {
    if (step === "main") {
      setMainSection("update");
      setPortfolioView("total");
      setVisiblePortfolioScopes(Object.keys(portfolioScopeOptions));
    }
  }, [step]);
  const {
    addAsset,
    updateAsset,
    requestDeleteAsset,
    assetToDelete,
    confirmDeleteAsset,
    cancelDeleteAsset,
    deletedAsset,
    undoDeleteAsset,
    clearDeletedAsset
  } = useAssetManager({ assets, assetTypes, setAssetsAndUpdateSnapshot, setEditAsset });
  const {
    addLiability,
    updateLiability,
    requestDeleteLiability,
    liabilityToDelete,
    confirmDeleteLiability,
    cancelDeleteLiability,
    deletedLiability,
    undoDeleteLiability,
    clearDeletedLiability
  } = useLiabilityManager({ assets, liabilities, setAssetsAndUpdateSnapshot, setEditLiability });
  reactExports.useEffect(() => {
    if (!driveConfigured) return;
    initDrive({ apiKey: driveApiKey, clientId: driveClientId }).then((ready) => {
      setDriveAvailable(Boolean(ready));
      if (!ready) setError("Google Drive could not be initialized. Drive operations are disabled.");
    }).catch(() => {
      setDriveAvailable(false);
      setError("Google Drive could not be initialized. Drive operations are disabled.");
    });
  }, [driveConfigured, driveApiKey, driveClientId, setError]);
  function handleJsonSave(object) {
    const data = upgradePortfolio(object);
    const orderedSnapshots = (data.snapshots || []).slice().sort((left, right) => new Date(left.asOf) - new Date(right.asOf));
    const nextAssetTypes = data.assetTypes || cloneDefaults(defaultAssetTypes);
    const nextLiabilityTypes = data.liabilityTypes || cloneDefaults(defaultLiabilityTypes);
    setSnapshots(orderedSnapshots);
    const latest = orderedSnapshots[orderedSnapshots.length - 1];
    if (latest) {
      setAssets((latest.assets || []).map((asset) => normalizeStoredAsset({
        ...asset,
        id: asset.id || mkId(),
        name: asset.name || labelFor(asset.type, nextAssetTypes)
      }, nextAssetTypes)));
      setLiabilities((latest.liabilities || []).map((liability) => ({
        ...liability,
        id: liability.id || mkId(),
        name: liability.name || labelFor(liability.type, nextLiabilityTypes)
      })));
      setCurrentIndex(orderedSnapshots.length - 1);
    } else {
      setAssets([]);
      setLiabilities([]);
      setCurrentIndex(0);
    }
    setCurrency(data.currency || DEFAULT_PORTFOLIO.currency);
    setDimensions(data.dimensions || cloneDefaults(defaultDimensions));
    setStrategy(data.strategy || cloneDefaults(defaultStrategy));
    setAssetTypes(nextAssetTypes);
    setLiabilityTypes(nextLiabilityTypes);
  }
  const metrics = reactExports.useMemo(() => portfolioMetrics(assets, liabilities), [assets, liabilities]);
  const headlineValue = portfolioView === "total" ? metrics.totalNetWorth : portfolioView === "investable" ? metrics.investableAssets : metrics.financialPortfolio;
  const series = reactExports.useMemo(() => buildSeries(snapshots, period, portfolioView, assetTypes), [snapshots, period, portfolioView, assetTypes]);
  const comparisonSeries = reactExports.useMemo(() => buildPortfolioComparisonSeries(snapshots, period), [snapshots, period]);
  const currentAmounts = reactExports.useMemo(
    () => currentByDimension(assets, selectedDimension, assetTypes, {}, portfolioView),
    [assets, selectedDimension, assetTypes, portfolioView]
  );
  const selectedPolicy = strategy.dimensionPolicies?.[selectedDimension] || {};
  const targetAmounts = reactExports.useMemo(() => {
    if (portfolioView !== "financial" || selectedPolicy.mode !== "target") return {};
    return Object.fromEntries(Object.entries(selectedPolicy.categories || {}).map(([category, config]) => [
      category,
      metrics.financialPortfolio * ((Number(config.target) || 0) / 100)
    ]));
  }, [portfolioView, selectedPolicy, metrics.financialPortfolio]);
  const selectedRegistry = dimensionRegistry(selectedDimension, assetTypes, dimensions);
  const recommendation = reactExports.useMemo(
    () => recommendSurplusCash(assets, strategy, assetTypes, dimensions),
    [assets, strategy, assetTypes, dimensions]
  );
  const previousAssets = currentIndex > 0 ? snapshots[currentIndex - 1]?.assets || [] : [];
  const previousLiabilities = currentIndex > 0 ? snapshots[currentIndex - 1]?.liabilities || [] : [];
  const previousMetrics = currentIndex > 0 ? portfolioMetrics(previousAssets, previousLiabilities) : null;
  const previousHeadline = previousMetrics == null ? null : portfolioView === "total" ? previousMetrics.totalNetWorth : portfolioView === "investable" ? previousMetrics.investableAssets : previousMetrics.financialPortfolio;
  const nominalChange = previousHeadline == null ? null : headlineValue - previousHeadline;
  const visibleAssets = assets.filter((asset) => visiblePortfolioScopes.includes(asset.portfolioScope));
  const previousVisibleAssets = previousAssets.filter((asset) => visiblePortfolioScopes.includes(asset.portfolioScope));
  const visibleAssetLabel = visiblePortfolioScopes.length === Object.keys(portfolioScopeOptions).length ? "Total Assets" : visiblePortfolioScopes.length === 1 ? portfolioScopeOptions[visiblePortfolioScopes[0]].name : "Filtered Assets";
  const isLatestSnapshot = currentIndex === snapshots.length - 1;
  const referencedCurrencies = Array.from(/* @__PURE__ */ new Set([
    currency,
    ...snapshots.flatMap((snapshot) => (snapshot.assets || []).map((asset) => asset.pricingCurrency)).filter(Boolean)
  ]));
  function requestClosePortfolio() {
    if (dirty) setClosePortfolioOpen(true);
    else handleCloseFile({ save: false });
  }
  function openBackupModal(mode) {
    setError(null);
    setBackupModalMode(mode);
  }
  async function saveAndClosePortfolio() {
    const result = await handleCloseFile({ save: true });
    if (result !== false) setClosePortfolioOpen(false);
  }
  async function discardAndClosePortfolio() {
    const result = await handleCloseFile({ save: false });
    if (result !== false) setClosePortfolioOpen(false);
  }
  function handleMainSectionChange(section) {
    if (section === "guidance" && snapshots.length && currentIndex !== snapshots.length - 1) {
      handleSelectSnapshot(snapshots.length - 1);
    }
    setMainSection(section);
  }
  function updateVisibleAssets(nextVisibleAssets) {
    const updates = new Map(nextVisibleAssets.map((asset) => [asset.id, asset]));
    setAssetsAndUpdateSnapshot(assets.map((asset) => updates.get(asset.id) || asset));
  }
  function togglePortfolioScope(scope) {
    setVisiblePortfolioScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : Object.keys(portfolioScopeOptions).filter((item) => item === scope || current.includes(item)));
  }
  const mainContent = mainSection === "update" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Update portfolio" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-zinc-400", children: "Update the latest holdings and liabilities before reviewing the portfolio." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortfolioScopeFilter,
      {
        values: visiblePortfolioScopes,
        onToggle: togglePortfolioScope,
        title: "Asset scopes",
        description: "Each switch controls one assigned scope. Combine them to show any subset of holdings."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: `${visibleAssetLabel} (${visibleAssets.length})`, right: isLatestSnapshot ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddBtn, { onClick: () => setAddOpen(true), title: "Add asset" }) : null, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SnapshotTabs,
        {
          snapshots,
          currentIndex,
          onSelect: handleSelectSnapshot,
          onAdd: handleAddSnapshot,
          onChangeDate: handleChangeSnapshotDate,
          onDelete: handleDeleteSnapshot,
          onRestore: handleRestoreSnapshot
        }
      ),
      !isLatestSnapshot && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 rounded-lg border border-amber-900/60 bg-amber-950/20 p-2 text-xs text-amber-300", children: "Historical snapshot: values are read-only." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        AssetTable,
        {
          assets: visibleAssets,
          prevAssets: previousVisibleAssets,
          setAssets: updateVisibleAssets,
          assetTypes,
          currency,
          readOnly: !isLatestSnapshot,
          onEdit: setEditAsset
        }
      )
    ] }),
    visiblePortfolioScopes.includes("total") && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Liabilities", right: isLatestSnapshot ? /* @__PURE__ */ jsxRuntimeExports.jsx(AddBtn, { onClick: () => setAddLiabilityOpen(true), title: "Add liability" }) : null, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      LiabilityTable,
      {
        liabilities,
        prevLiabilities: previousLiabilities,
        setLiabilities: (next) => setAssetsAndUpdateSnapshot(assets, next),
        liabilityTypes,
        currency,
        readOnly: !isLatestSnapshot,
        onEdit: setEditLiability
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => handleMainSectionChange("analysis"), className: "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400", children: [
      isLatestSnapshot ? "Review updated analysis" : "Review selected analysis",
      " →"
    ] }) })
  ] }) : mainSection === "guidance" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Guidance" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-zinc-400", children: "Act on cash reserve and next-investment guidance calculated from the latest check-in." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Cash reserve and next investment", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SurplusPlan, { recommendation, assets, strategy, assetTypes, dimensions, currency }) })
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Analysis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-zinc-400", children: "Review totals, allocation, concentration, and history from different portfolio views." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PortfolioTotals, { metrics, requiredCashReserve: recommendation.effectiveReserveTarget, currency }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortfolioViewSelector,
      {
        value: portfolioView,
        onChange: setPortfolioView,
        title: "Analysis view",
        description: "Filters allocation, concentration, and current-view history."
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Section,
        {
          title: "Current allocation",
          right: portfolioView === "financial" && selectedPolicy.mode === "target" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onMouseDown: () => setShowTarget(true),
              onMouseUp: () => setShowTarget(false),
              onMouseLeave: () => setShowTarget(false),
              className: "rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs hover:bg-zinc-700",
              title: "Show target while held",
              children: "Hold for target"
            }
          ) : null,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 text-sm text-zinc-400", children: [
              portfolioViews[portfolioView].name,
              " by ",
              selectedDimension === "asset_type" ? "asset type" : dimensions[selectedDimension]?.name || selectedDimension
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(PieChart, { data: currentAmounts, targetData: targetAmounts, showTarget, assetTypes: selectedRegistry })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Section,
        {
          title: "History",
          right: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: period, onChange: (event) => setPeriod(event.target.value), className: "rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "monthly", children: "Monthly" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "yearly", children: "Yearly" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex overflow-hidden rounded-lg border border-zinc-700 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChartMode("total"), className: `px-2 py-1 ${chartMode === "total" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`, children: "Current view" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChartMode("category"), className: `px-2 py-1 ${chartMode === "category" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`, children: "By asset type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChartMode("scopes"), className: `px-2 py-1 ${chartMode === "scopes" ? "bg-blue-600" : "bg-zinc-800 hover:bg-zinc-700"}`, children: "Compare scopes" })
            ] })
          ] }),
          children: [
            chartMode === "total" && /* @__PURE__ */ jsxRuntimeExports.jsx(LineChart, { data: series, currency, showGridlines: series.length > 2, showMarkers: series.length > 2, showVerticalGridlines: period === "monthly" }),
            chartMode === "category" && /* @__PURE__ */ jsxRuntimeExports.jsx(StackedAreaChart, { data: series, assetTypes, currency }),
            chartMode === "scopes" && /* @__PURE__ */ jsxRuntimeExports.jsx(ScopeHistoryChart, { data: comparisonSeries, currency }),
            nominalChange != null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "Change " }),
              formatCurrency(nominalChange, currency)
            ] }) })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Portfolio concentration", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConcentrationPanel,
      {
        assets,
        assetTypes,
        dimensions,
        strategy,
        currency,
        selectedDimension,
        onSelectDimension: setSelectedDimension,
        portfolioView
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => handleMainSectionChange("guidance"), className: "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400", children: "Review latest guidance →" }) })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-zinc-100", children: [
    step === "pick" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center p-6 gap-4", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-lg p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200", children: error }),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-zinc-400", children: "Opening portfolio…" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, onClick: handleOpenExisting, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50", children: "Open existing file" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, onClick: handleCreateNew, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50", children: "Create new file" }),
      driveAvailable && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, onClick: handleOpenDrive, className: "h-12 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50", children: "Open from Google Drive" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, onClick: () => openBackupModal("import"), className: "h-10 px-4 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50", children: "Import backup" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: loading, onClick: handleOpenSample, className: "text-sm text-blue-400 underline disabled:opacity-50", children: "Open sample portfolio" }),
      builtAgo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-zinc-400", children: [
        "Built ",
        builtAgo
      ] })
    ] }),
    step === "password" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (event) => {
      event.preventDefault();
      handleLoad();
    }, className: "max-w-md mx-auto p-6 space-y-4", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-400", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TextInput, { label: "Password", type: "password", value: password, onChange: setPassword, className: "w-full", autoFocus: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: loading, onClick: () => {
          setFileHandle(null);
          setPassword("");
          setError(null);
          setStep("pick");
        }, className: "h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading || !password, className: "h-10 px-3 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50", children: loading ? "Opening…" : "Open" })
      ] })
    ] }),
    step === "main" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto p-4 md:p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-col items-start justify-between gap-4 md:flex-row md:items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-semibold", children: "Portfolio Strategy Tracker" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400", children: "Private by default · Monthly check-ins · Explainable allocation guidance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-wrap items-center justify-end gap-3 md:w-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: dirty ? "text-amber-400" : "text-zinc-400", children: dirty ? "● Unsaved changes" : canSave ? "Saved" : "Sample portfolio · not saved to a file" }),
              !dirty && lastSavedAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-zinc-600", children: [
                "Saved at ",
                lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSave, disabled: loading || !canSave || !dirty, className: `h-10 rounded-lg border px-4 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${dirty && canSave ? "border-blue-500 bg-blue-600 hover:bg-blue-500" : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"}`, children: loading ? "Saving…" : "Save" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openBackupModal("export"), disabled: loading, className: "h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm hover:bg-zinc-700 disabled:opacity-50", children: "Backup" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setConfigOpen(true), className: "h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm hover:bg-zinc-700", children: "Settings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: requestClosePortfolio, disabled: loading, className: "h-10 rounded-lg border border-zinc-700 bg-zinc-800 px-4 text-sm hover:bg-zinc-700 disabled:opacity-50", children: "Close portfolio" })
          ] })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200", children: error }),
        loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 rounded-xl bg-zinc-800 text-zinc-300", children: "Working…" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Portfolio workflow section" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: mainSection, onChange: (event) => handleMainSectionChange(event.target.value), className: "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500", children: workflowSections.map((section, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: section.key, children: [
            index + 1,
            ". ",
            section.label
          ] }, section.key)) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "sticky top-4 hidden w-60 shrink-0 rounded-xl border border-zinc-800 bg-zinc-900/30 p-3 md:block", "aria-label": "Portfolio workflow", children: workflowSections.map((section, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleMainSectionChange(section.key),
              "aria-current": mainSection === section.key ? "page" : void 0,
              className: `mb-1 flex w-full gap-3 rounded-lg px-3 py-3 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${mainSection === section.key ? "bg-blue-600 text-white" : "text-zinc-300 hover:bg-zinc-900"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${mainSection === section.key ? "bg-white/20" : "bg-zinc-800"}`, children: index + 1 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-medium", children: section.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `mt-0.5 block text-xs ${mainSection === section.key ? "text-blue-100" : "text-zinc-500"}`, children: section.description })
                ] })
              ]
            },
            section.key
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-w-0 flex-1", children: mainContent })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "text-center text-xs text-zinc-500 py-8", children: [
        "v",
        pkg.version
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddAssetModal, { open: addOpen, onClose: () => setAddOpen(false), assetTypes, assets, dimensions, currency, referencedCurrencies, onAdd: addAsset }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AddLiabilityModal, { open: addLiabilityOpen, onClose: () => setAddLiabilityOpen(false), liabilityTypes, currency, onAdd: addLiability }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditAssetModal, { open: !!editAsset, asset: editAsset, onClose: () => setEditAsset(null), assetTypes, assets, dimensions, currency, referencedCurrencies, onSave: updateAsset, onDelete: requestDeleteAsset }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(EditLiabilityModal, { open: !!editLiability, liability: editLiability, onClose: () => setEditLiability(null), liabilityTypes, currency, onSave: updateLiability, onDelete: requestDeleteLiability }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: !!assetToDelete, title: "Delete asset?", message: assetToDelete ? `Delete “${assetToDelete.name}” from the current portfolio snapshot?` : "", onConfirm: confirmDeleteAsset, onCancel: cancelDeleteAsset }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ConfirmModal, { open: !!liabilityToDelete, title: "Delete liability?", message: liabilityToDelete ? `Delete “${liabilityToDelete.name}” from the current portfolio snapshot?` : "", onConfirm: confirmDeleteLiability, onCancel: cancelDeleteLiability }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        JsonEditorModal,
        {
          open: jsonOpen,
          onClose: () => setJsonOpen(false),
          data: { ...DEFAULT_PORTFOLIO, currency, assetTypes, liabilityTypes, dimensions, strategy, snapshots },
          onSave: handleJsonSave
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ClosePortfolioModal, { open: closePortfolioOpen, canSave, loading, onCancel: () => setClosePortfolioOpen(false), onSaveAndClose: saveAndClosePortfolio, onDiscardAndClose: discardAndClosePortfolio }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: deletedAsset ? `Asset “${deletedAsset.asset.name}” deleted.` : "", onUndo: undoDeleteAsset, onDismiss: clearDeletedAsset }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(UndoToast, { message: deletedLiability ? `Liability “${deletedLiability.liability.name}” deleted.` : "", onUndo: undoDeleteLiability, onDismiss: clearDeletedLiability })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      PortfolioBackupModal,
      {
        open: !!backupModalMode,
        initialMode: backupModalMode || "export",
        allowExport: step === "main",
        defaultPassword: password,
        loading,
        error: error || "",
        hasUnsavedChanges: dirty,
        onClose: () => {
          setBackupModalMode(null);
          setError(null);
        },
        onExport: handleExportBackup,
        onImport: handleImportBackup
      }
    ),
    configOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfigPage,
      {
        assetTypes,
        setAssetTypes,
        liabilityTypes,
        setLiabilityTypes,
        currency,
        setCurrency,
        dimensions,
        setDimensions,
        strategy,
        setStrategy,
        assets: snapshots[snapshots.length - 1]?.assets || assets,
        liabilities: snapshots[snapshots.length - 1]?.liabilities || liabilities,
        dirty,
        driveConfigured,
        driveAvailable,
        onDone: () => setConfigOpen(false),
        onEditJson: () => setJsonOpen(true),
        onExportBackup: () => openBackupModal("export"),
        onImportBackup: () => openBackupModal("import"),
        onReviewScopes: () => {
          setConfigOpen(false);
          setMainSection("update");
          setPortfolioView("total");
          if (snapshots.length) handleSelectSnapshot(snapshots.length - 1);
        },
        referencedCurrencies,
        nestedDialogOpen: jsonOpen || !!backupModalMode
      }
    )
  ] });
}
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
