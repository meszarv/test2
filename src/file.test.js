import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { convertV6ToV7, upgradePortfolio, DEFAULT_PORTFOLIO, readPortfolioFile, writePortfolioFile } from './file.js';
import { netWorth } from './data.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

test('netWorth subtracts liabilities from assets', () => {
  const assets = [{ value: 100 }, { value: 50 }];
  const liabilities = [{ value: 80 }];
  assert.equal(netWorth(assets, liabilities), 70);
});

test('upgradePortfolio adds currency and bumps version', () => {
  const old = { version: 1, assetTypes: {}, allocation: {}, snapshots: [] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.equal(upgraded.currency, 'USD');
});

test('upgradePortfolio adds liabilities and bumps version from v2', () => {
  const old = { version: 2, currency: 'USD', assetTypes: {}, allocation: {}, snapshots: [{ asOf: '2024-01-01', assets: [] }] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.deepEqual(upgraded.liabilityTypes, DEFAULT_PORTFOLIO.liabilityTypes);
  assert.deepEqual(upgraded.snapshots[0].liabilities, []);
  assert.deepEqual(upgraded.liabilities, []);
});

test('upgradePortfolio preserves existing liabilities from v3', () => {
  const old = {
    version: 3,
    currency: 'USD',
    assetTypes: {},
    liabilityTypes: {},
    allocation: {},
    liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', value: 100 }],
    snapshots: [],
  };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.deepEqual(upgraded.liabilities, old.liabilities.map((l) => ({ ...l, priority: false })));
});

function memoryHandle() {
  let buffer = new Uint8Array();
  return {
    async createWritable() {
      return {
        async write(data) {
          buffer = new Uint8Array(data);
        },
        async close() {},
      };
    },
    async getFile() {
      return {
        size: buffer.length,
        async arrayBuffer() {
          return buffer;
        },
      };
    },
  };
}

test('writePortfolioFile/readPortfolioFile round-trips liabilities', async () => {
  const handle = memoryHandle();
  const data = {
    ...DEFAULT_PORTFOLIO,
    liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', value: 500, priority: true }],
    snapshots: [
      { asOf: '2024-01-01', assets: [], liabilities: [{ id: 'l1', type: 'loan', value: 500, priority: true }] },
    ],
  };
  const password = 'pw';
  await writePortfolioFile(handle, password, data);
  const read = await readPortfolioFile(handle, password);
  assert.deepEqual(read.liabilities, data.liabilities);
  assert.deepEqual(read.snapshots[0].liabilities, data.snapshots[0].liabilities);
});

test('upgradePortfolio adds top-level liabilities and bumps version from v3', () => {
  const old = { version: 3, currency: 'USD', assetTypes: {}, liabilityTypes: {}, allocation: {}, snapshots: [] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.deepEqual(upgraded.liabilities, []);
});

test('upgradePortfolio adds priority to liabilities from v4', () => {
  const old = {
    version: 4,
    currency: 'USD',
    assetTypes: {},
    liabilityTypes: {},
    allocation: {},
    liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', value: 100 }],
    snapshots: [{ asOf: '2024-01-01', assets: [], liabilities: [{ id: 'l1', type: 'loan', value: 100 }] }],
  };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.equal(upgraded.liabilities[0].priority, false);
  assert.equal(upgraded.snapshots[0].liabilities[0].priority, false);
});

test('upgradePortfolio converts v5 allocation and asset observations through v7', () => {
  const old = {
    version: 5,
    currency: 'EUR',
    assetTypes: { cash: { name: 'Cash' }, stock: { name: 'Stock' } },
    liabilityTypes: {},
    allocation: { cash: 20, stock: 80 },
    liabilities: [],
    snapshots: [
      { asOf: '2025-01-15T00:00:00.000Z', assets: [{ name: 'Broker ETF', type: 'stock', value: 100 }], liabilities: [] },
      { asOf: '2025-02-15T00:00:00.000Z', assets: [{ name: 'Broker ETF', type: 'stock', value: 120 }], liabilities: [] },
    ],
  };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, 7);
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.mode, 'target');
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.categories.stock.target, 80);
  assert.equal(upgraded.snapshots[0].assets[0].id, upgraded.snapshots[1].assets[0].id);
  assert.equal(upgraded.snapshots[1].assets[0].ownershipShare, 100);
  assert.equal(upgraded.snapshots[1].assets[0].portfolioScope, 'financial');
  assert.deepEqual(upgraded.incomeRecords, []);
});

test('convertV6ToV7 infers scopes, preserves history, and flags ambiguous assets', () => {
  const old = {
    version: 6,
    currency: 'EUR',
    assetTypes: {
      cash: { name: 'Cash', dimensionRules: {} },
      stock: { name: 'Stock', dimensionRules: {} },
      real_estate: { name: 'Real estate', dimensionRules: {} },
      private_equity: { name: 'Private equity', dimensionRules: {} },
      collectible: { name: 'Collectible', dimensionRules: {} },
    },
    liabilityTypes: { loan: { name: 'Loan' } },
    dimensions: {},
    strategy: { cashReserveTarget: 500 },
    incomeRecords: [{ id: 'income-1', year: 2025, rent: 100 }],
    liabilities: [{ id: 'loan-1', type: 'loan', value: 10, priority: false }],
    snapshots: [
      {
        asOf: '2025-01-15T00:00:00.000Z',
        contributions: 5,
        withdrawals: 1,
        liabilities: [{ id: 'loan-1', type: 'loan', value: 10, priority: false }],
        assets: [
          { id: 'cash-1', name: 'Bank', type: 'cash', value: 50, isCheckingAccount: true },
          { id: 'stock-1', name: 'ETF', type: 'stock', value: 100, eligibleForInvestment: true },
          { id: 'home-1', name: 'Home', type: 'real_estate', value: 200 },
          { id: 'company-1', name: 'Company', type: 'private_equity', value: 300 },
          { id: 'art-1', name: 'Art', type: 'collectible', value: 400 },
        ],
      },
      {
        asOf: '2025-02-15T00:00:00.000Z',
        liabilities: [{ id: 'loan-1', type: 'loan', value: 9, priority: false }],
        assets: [
          { id: 'cash-1', name: 'Bank', type: 'cash', value: 60, isCheckingAccount: true },
          { id: 'stock-1', name: 'ETF', type: 'stock', value: 110, eligibleForInvestment: true },
          { id: 'home-1', name: 'Home', type: 'real_estate', value: 200 },
          { id: 'company-1', name: 'Company', type: 'private_equity', value: 310 },
          { id: 'art-1', name: 'Art', type: 'collectible', value: 410 },
        ],
      },
    ],
  };
  const converted = convertV6ToV7(old);
  const assets = converted.snapshots[0].assets;
  assert.equal(converted.version, 7);
  assert.equal(assets.find((asset) => asset.id === 'cash-1').portfolioScope, 'investable');
  assert.equal(assets.find((asset) => asset.id === 'stock-1').portfolioScope, 'financial');
  assert.equal(assets.find((asset) => asset.id === 'home-1').portfolioScope, 'total');
  assert.equal(assets.find((asset) => asset.id === 'company-1').scopeNeedsReview, false);
  assert.equal(assets.find((asset) => asset.id === 'art-1').portfolioScope, 'total');
  assert.equal(assets.find((asset) => asset.id === 'art-1').scopeNeedsReview, true);
  assert.equal(converted.snapshots[1].assets.find((asset) => asset.id === 'art-1').value, 410);
  assert.equal(converted.snapshots[0].contributions, 5);
  assert.deepEqual(converted.incomeRecords, old.incomeRecords);
  assert.equal(converted.assetTypes.stock.scopeRule.value, 'financial');
  assert.deepEqual(converted.assetTypes.collectible.scopeRule, { mode: 'user', value: '' });
  assert.deepEqual(upgradePortfolio(converted), converted);
});

test('upgradePortfolio preserves stored historical scopes when type rules later change', () => {
  const portfolio = {
    ...DEFAULT_PORTFOLIO,
    assetTypes: {
      stock: { name: 'Stock', scopeRule: { mode: 'locked', value: 'total' }, dimensionRules: {} },
    },
    snapshots: [{
      asOf: '2026-01-15T00:00:00.000Z',
      assets: [{ id: 'etf-1', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 100 }],
      liabilities: [],
    }],
  };
  const upgraded = upgradePortfolio(portfolio);
  assert.equal(upgraded.snapshots[0].assets[0].portfolioScope, 'financial');
});
