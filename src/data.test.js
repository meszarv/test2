import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assetValue,
  annualIncomeSummary,
  concentrationRows,
  defaultDimensions,
  mergeStrategy,
  portfolioMetrics,
  rebalance,
  recommendSurplusCash,
} from './data.js';

test('rebalance invests remaining cash after paying priority liabilities', () => {
  const assets = [
    { type: 'cash', value: 100 },
    { type: 'stock', value: 0 },
  ];
  const liabilities = [
    { type: 'loan', value: 80, priority: true },
  ];
  const { investPlan, priorityDebt, priorityPayoff } = rebalance(assets, liabilities, { stock: 1 });
  assert.equal(Math.round(investPlan.stock), 20);
  assert.equal(Math.round(investPlan.cash), -20);
  assert.equal(priorityDebt, 0);
  assert.equal(priorityPayoff, 80);
});

test('rebalance returns remaining priority debt', () => {
  const assets = [
    { type: 'cash', value: 50 },
  ];
  const liabilities = [
    { type: 'loan', value: 80, priority: true },
  ];
  const { priorityDebt, priorityPayoff, byCat, totalNow } = rebalance(assets, liabilities, {});
  assert.equal(priorityDebt, 30);
  assert.equal(priorityPayoff, 50);
  const sumByCat = Object.values(byCat).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(sumByCat - priorityDebt), Math.round(totalNow));
});

test('rebalance byCat excludes priority debt from totals', () => {
  const assets = [
    { type: 'cash', value: 50 },
    { type: 'stock', value: 100 },
  ];
  const liabilities = [
    { type: 'loan', value: 80, priority: true },
    { type: 'loan', value: 20 },
  ];
  const { byCat, priorityDebt, totalNow } = rebalance(assets, liabilities, { stock: 1 });
  const sumByCat = Object.values(byCat).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(sumByCat - priorityDebt), Math.round(totalNow));
});

test('rebalance cashCurrent excludes priority payoff', () => {
  const assets = [
    { type: 'cash', value: 100 },
    { type: 'stock', value: 100 },
  ];
  const liabilities = [
    { type: 'loan', value: 80, priority: true },
    { type: 'loan', value: 20 },
  ];
  const { cashCurrent, byCat } = rebalance(assets, liabilities, {});
  assert.equal(Math.round(cashCurrent), 90);
  assert.equal(Math.round(byCat.cash), 17);
});

test('assetValue calculates unit valuation, FX, and ownership share', () => {
  const value = assetValue({
    valuationMode: 'units',
    quantity: 10,
    unitPrice: 25,
    fxRate: 1.2,
    ownershipShare: 50,
    status: 'active',
  });
  assert.equal(value, 150);
});

test('concentrationRows applies split exposures and surfaces unclassified values', () => {
  const assets = [
    { id: 'a', type: 'stock', value: 100, ownershipShare: 100, dimensions: { geography: { europe: 60, north_america: 40 } } },
    { id: 'b', type: 'bond', value: 100, ownershipShare: 100, dimensions: {} },
  ];
  const rows = concentrationRows(assets, 'geography', { mode: 'informational', categories: {} }, {}, defaultDimensions);
  assert.equal(Math.round(rows.find((row) => row.category === 'europe').current), 30);
  assert.equal(Math.round(rows.find((row) => row.category === 'north_america').current), 20);
  assert.equal(Math.round(rows.find((row) => row.category === 'unclassified').current), 50);
});

test('recommendSurplusCash keeps the reserve and directs surplus toward target gaps', () => {
  const strategy = mergeStrategy({
    cashReserveTarget: 20,
    dimensionPolicies: {
      asset_type: {
        mode: 'target',
        tolerance: 0,
        importance: 3,
        categories: {
          cash: { target: 20 },
          stock: { target: 80 },
        },
      },
    },
  });
  const assets = [
    { id: 'cash', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 60, ownershipShare: 100, isCheckingAccount: true },
    { id: 'stock', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 40, ownershipShare: 100, eligibleForInvestment: true },
  ];
  const recommendation = recommendSurplusCash(assets, strategy, {}, defaultDimensions);
  assert.equal(recommendation.checkingCash, 60);
  assert.equal(recommendation.surplus, 40);
  assert.equal(Math.round(recommendation.plan[0].amount), 40);
  assert.equal(recommendation.plan[0].assetId, 'stock');
  assert.equal(Math.round(recommendation.projectedValues.cash), 20);
  assert.equal(Math.round(recommendation.projectedValues.stock), 80);
  assert.equal(Math.round(recommendation.currentMetrics.totalAssets), Math.round(recommendation.projectedMetrics.totalAssets));
  assert.equal(Math.round(recommendation.currentMetrics.totalNetWorth), Math.round(recommendation.projectedMetrics.totalNetWorth));
  assert.equal(Math.round(recommendation.currentMetrics.investableAssets), Math.round(recommendation.projectedMetrics.investableAssets));
  assert.equal(recommendation.currentMetrics.financialPortfolio, 40);
  assert.equal(Math.round(recommendation.projectedMetrics.financialPortfolio), 80);
});

test('recommendSurplusCash does not worsen a hard maximum', () => {
  const strategy = mergeStrategy({
    cashReserveTarget: 20,
    dimensionPolicies: {
      asset_type: {
        mode: 'limits',
        categories: { stock: { max: 40 }, bond: { max: 100 } },
      },
    },
  });
  const assets = [
    { id: 'cash', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 60, ownershipShare: 100, isCheckingAccount: true },
    { id: 'stock', name: 'Stock ETF', type: 'stock', portfolioScope: 'financial', value: 40, ownershipShare: 100, eligibleForInvestment: true },
    { id: 'bond', name: 'Bond ETF', type: 'bond', portfolioScope: 'financial', value: 0, ownershipShare: 100, eligibleForInvestment: true },
  ];
  const recommendation = recommendSurplusCash(assets, strategy, {}, defaultDimensions);
  assert.equal(recommendation.plan.some((item) => item.assetId === 'stock'), false);
  assert.equal(Math.round(recommendation.plan.find((item) => item.assetId === 'bond').amount), 40);
});

test('portfolioMetrics applies nested scopes, ownership, status, and liabilities', () => {
  const assets = [
    { id: 'home', portfolioScope: 'total', value: 100, ownershipShare: 100 },
    { id: 'bank', portfolioScope: 'investable', value: 50, ownershipShare: 100 },
    { id: 'etf', portfolioScope: 'financial', valuationMode: 'units', quantity: 2, unitPrice: 20, fxRate: 1, ownershipShare: 50 },
    { id: 'closed', portfolioScope: 'financial', value: 900, ownershipShare: 100, status: 'closed' },
  ];
  const metrics = portfolioMetrics(assets, [{ value: 30 }]);
  assert.deepEqual(metrics, {
    totalAssets: 170,
    totalLiabilities: 30,
    totalNetWorth: 140,
    investableAssets: 70,
    financialPortfolio: 20,
  });
  assert.ok(metrics.financialPortfolio <= metrics.investableAssets);
  assert.ok(metrics.investableAssets <= metrics.totalAssets);
});

test('concentrationRows filters amounts to the requested nested portfolio view', () => {
  const assets = [
    { id: 'home', type: 'real_estate', portfolioScope: 'total', value: 100, ownershipShare: 100 },
    { id: 'bank', type: 'cash', portfolioScope: 'investable', value: 50, ownershipShare: 100 },
    { id: 'etf', type: 'stock', portfolioScope: 'financial', value: 25, ownershipShare: 100 },
  ];
  const rows = concentrationRows(assets, 'asset_type', { mode: 'informational', categories: {} }, {}, defaultDimensions, {}, 'financial');
  assert.equal(rows.find((row) => row.category === 'stock').amount, 25);
  assert.equal(rows.some((row) => row.category === 'cash' && row.amount > 0), false);
  assert.equal(rows.some((row) => row.category === 'real_estate' && row.amount > 0), false);
});

test('annualIncomeSummary keeps gross income and costs separate', () => {
  const summary = annualIncomeSummary([
    { year: 2026, dividends: 100, interest: 20, fees: 5 },
    { year: 2026, rent: 500, repairs: 100 },
    { year: 2025, dividends: 999 },
  ], 2026);
  assert.deepEqual(summary, { gross: 620, costs: 105, net: 515 });
});
