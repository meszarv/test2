import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assetValue,
  concentrationRows,
  defaultDimensions,
  mergeStrategy,
  planCashTransfers,
  portfolioMetrics,
  recommendSurplusCash,
} from './data.js';

test('assetValue calculates unit valuation, FX, and ownership share', () => {
  const value = assetValue({
    valuationMode: 'units',
    quantity: 10,
    unitPrice: 25,
    fxRate: 1.2,
    ownershipShare: 50,
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
          stock: { target: 100 },
        },
      },
    },
  });
  const assets = [
    { id: 'cash', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 60, ownershipShare: 100, isCheckingAccount: true },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 0, ownershipShare: 100, isInvestmentCashAccount: true },
    { id: 'stock', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 40, ownershipShare: 100, eligibleForInvestment: true },
  ];
  const recommendation = recommendSurplusCash(assets, strategy, {}, defaultDimensions);
  assert.equal(recommendation.checkingCash, 60);
  assert.equal(recommendation.surplus, 40);
  assert.equal(Math.round(recommendation.plan[0].amount), 40);
  assert.equal(recommendation.plan[0].assetId, 'stock');
  assert.equal(Math.round(recommendation.projectedValues.cash), 20);
  assert.equal(Math.round(recommendation.projectedValues['investment-cash']), 0);
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
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 0, ownershipShare: 100, isInvestmentCashAccount: true },
    { id: 'stock', name: 'Stock ETF', type: 'stock', portfolioScope: 'financial', value: 40, ownershipShare: 100, eligibleForInvestment: true },
    { id: 'bond', name: 'Bond ETF', type: 'bond', portfolioScope: 'financial', value: 0, ownershipShare: 100, eligibleForInvestment: true },
  ];
  const recommendation = recommendSurplusCash(assets, strategy, {}, defaultDimensions);
  assert.equal(recommendation.plan.some((item) => item.assetId === 'stock'), false);
  assert.equal(Math.round(recommendation.plan.find((item) => item.assetId === 'bond').amount), 40);
});

test('planCashTransfers replenishes account reserves before funding investment cash', () => {
  const assets = [
    { id: 'checking-a', name: 'Checking A', type: 'cash', portfolioScope: 'investable', value: 3000, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: 5000 },
    { id: 'checking-b', name: 'Checking B', type: 'cash', portfolioScope: 'investable', value: 7000, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: '' },
    { id: 'checking-c', name: 'Checking C', type: 'cash', portfolioScope: 'investable', value: 3500, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: '' },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 1000, ownershipShare: 100, isInvestmentCashAccount: true },
  ];

  const routing = planCashTransfers(assets, { cashReserveTarget: 12000 });

  assert.deepEqual(routing.accountReserves.map((account) => [account.name, account.reserve]), [
    ['Checking A', 5000],
    ['Checking B', 3500],
    ['Checking C', 3500],
  ]);
  assert.deepEqual(routing.transfers.map((transfer) => [transfer.fromName, transfer.toName, transfer.kind, Math.round(transfer.amount)]), [
    ['Checking B', 'Checking A', 'replenish', 2000],
    ['Checking B', 'Investment cash', 'invest', 1500],
  ]);
  assert.equal(routing.reserveShortfall, 0);
  assert.equal(routing.surplus, 1500);
  assert.equal(Math.round(routing.projectedValues['checking-a']), 5000);
  assert.equal(Math.round(routing.projectedValues['checking-b']), 3500);
  assert.equal(Math.round(routing.projectedValues['checking-c']), 3500);
  assert.equal(Math.round(routing.projectedValues['investment-cash']), 2500);
});

test('planCashTransfers uses investment cash to replenish reserves and reports any remaining shortfall', () => {
  const routing = planCashTransfers([
    { id: 'checking-a', name: 'Checking A', type: 'cash', portfolioScope: 'investable', value: 3000, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: 5000 },
    { id: 'checking-b', name: 'Checking B', type: 'cash', portfolioScope: 'investable', value: 3500, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: 3500 },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 1500, ownershipShare: 100, isInvestmentCashAccount: true },
  ], { cashReserveTarget: 8500 });

  assert.deepEqual(routing.transfers.map((transfer) => [transfer.fromName, transfer.toName, Math.round(transfer.amount)]), [
    ['Investment cash', 'Checking A', 1500],
  ]);
  assert.equal(routing.surplus, 0);
  assert.equal(Math.round(routing.reserveShortfall), 500);
  assert.equal(Math.round(routing.projectedValues['checking-a']), 4500);
  assert.equal(Math.round(routing.projectedValues['investment-cash']), 0);
});

test('portfolioMetrics applies nested scopes, ownership, and liabilities', () => {
  const assets = [
    { id: 'home', portfolioScope: 'total', value: 100, ownershipShare: 100 },
    { id: 'bank', portfolioScope: 'investable', value: 50, ownershipShare: 100 },
    { id: 'etf', portfolioScope: 'financial', valuationMode: 'units', quantity: 2, unitPrice: 20, fxRate: 1, ownershipShare: 50 },
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
