import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  convertLegacySnapshotToV1,
  convertV6ToV7,
  convertV7ToV8,
  convertV8ToV9,
  convertV9ToV10,
  DEFAULT_PORTFOLIO,
  encryptPortfolio,
  readPortfolioFile,
  upgradePortfolio,
  writePortfolioFile,
} from './file.js';
import { netWorth } from './data.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

test('netWorth subtracts liabilities from assets', () => {
  assert.equal(netWorth([{ value: 100 }, { value: 50 }], [{ value: 80 }]), 70);
});

test('upgradePortfolio upgrades the oldest supported format to the current version', () => {
  const upgraded = upgradePortfolio({ version: 1, assetTypes: {}, allocation: {}, snapshots: [] });
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.equal(upgraded.currency, 'USD');
  assert.deepEqual(upgraded.snapshots, []);
  assert.equal('incomeRecords' in upgraded, false);
  assert.equal('liabilities' in upgraded, false);
});

test('upgradePortfolio preserves legacy top-level liabilities in a snapshot', () => {
  const upgraded = upgradePortfolio({
    version: 3,
    currency: 'USD',
    assetTypes: {},
    liabilityTypes: { loan: { name: 'Loan' } },
    allocation: {},
    liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', value: 100, priority: true }],
    snapshots: [],
  });

  assert.equal(upgraded.version, 10);
  assert.equal(upgraded.snapshots.length, 1);
  assert.deepEqual(upgraded.snapshots[0].liabilities, [{ id: 'l1', name: 'Loan', type: 'loan', description: '', value: 100 }]);
});

function memoryHandle(initialBuffer = new Uint8Array()) {
  let buffer = new Uint8Array(initialBuffer);
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

test('readPortfolioFile opens an encrypted standalone snapshot from early releases', async () => {
  const legacySnapshot = {
    asOf: '2024-06-15T00:00:00.000Z',
    assetTypes: {
      cash: { label: 'Cash', fields: [{ key: 'currency', label: 'Currency', default: 'EUR' }] },
      stock: { label: 'Stock', fields: [{ key: 'ticker', label: 'Ticker' }] },
    },
    allocation: { cash: 25, stock: 75 },
    assets: [
      { type: 'cash', name: 'Bank account', currency: 'EUR', value: 500 },
      { type: 'stock', name: 'Index fund', ticker: 'ETF', value: 1500 },
    ],
  };
  const handle = memoryHandle(await encryptPortfolio(legacySnapshot, 'old-password'));

  const opened = await readPortfolioFile(handle, 'old-password');

  assert.equal(opened.version, 10);
  assert.equal(opened.snapshots.length, 1);
  assert.equal(opened.currency, 'EUR');
  assert.equal(opened.snapshots[0].asOf, legacySnapshot.asOf);
  assert.deepEqual(opened.snapshots[0].assets.map((asset) => asset.value), [500, 1500]);
  assert.equal(opened.assetTypes.cash.name, 'Cash');
  assert.equal(opened.strategy.dimensionPolicies.asset_type.categories.stock.target, 75);
});

test('readPortfolioFile opens an encrypted version 7 portfolio', async () => {
  const legacyPortfolio = {
    version: 7,
    currency: 'EUR',
    assetTypes: { stock: { name: 'Stock', scopeRule: { mode: 'default', value: 'financial' }, dimensionRules: {} } },
    liabilityTypes: {},
    dimensions: {},
    strategy: {},
    snapshots: [{
      asOf: '2025-06-15T00:00:00.000Z',
      contributions: 500,
      withdrawals: 0,
      assets: [{ id: 'stock-1', name: 'Index fund', type: 'stock', portfolioScope: 'financial', value: 2500, status: 'active' }],
      liabilities: [],
    }],
  };
  const handle = memoryHandle(await encryptPortfolio(legacyPortfolio, 'old-password'));

  const opened = await readPortfolioFile(handle, 'old-password');

  assert.equal(opened.version, 10);
  assert.equal(opened.snapshots[0].assets[0].value, 2500);
  assert.equal('contributions' in opened.snapshots[0], false);
});

test('convertLegacySnapshotToV1 leaves versioned portfolios alone', () => {
  const portfolio = { version: 7, snapshots: [] };
  assert.equal(convertLegacySnapshotToV1(portfolio), portfolio);
});

test('upgradePortfolio accepts numeric version values stored as strings', () => {
  const upgraded = upgradePortfolio({
    version: '7',
    currency: 'EUR',
    assetTypes: { cash: { name: 'Cash' } },
    liabilityTypes: {},
    dimensions: null,
    strategy: null,
    snapshots: [{ asOf: '2025-01-01T00:00:00.000Z', assets: [], liabilities: [] }],
  });

  assert.equal(upgraded.version, 10);
  assert.equal(upgraded.strategy.cashReserveTarget, 0);
  assert.ok(upgraded.dimensions.liquidity);
});

test('writePortfolioFile/readPortfolioFile round-trips current snapshots', async () => {
  const handle = memoryHandle();
  const data = {
    ...DEFAULT_PORTFOLIO,
    snapshots: [{
      asOf: '2026-01-01T00:00:00.000Z',
      assets: [{ id: 'a1', name: 'Cash', type: 'cash', portfolioScope: 'investable', value: 500 }],
      liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', description: '', value: 100 }],
    }],
  };
  await writePortfolioFile(handle, 'pw', data);
  const read = await readPortfolioFile(handle, 'pw');

  assert.equal(read.version, 10);
  assert.equal(read.snapshots[0].assets[0].value, 500);
  assert.deepEqual(read.snapshots[0].liabilities, data.snapshots[0].liabilities);
});

test('upgradePortfolio converts v5 allocation and reconciles legacy asset IDs', () => {
  const upgraded = upgradePortfolio({
    version: 5,
    currency: 'EUR',
    assetTypes: { cash: { name: 'Cash' }, stock: { name: 'Stock' } },
    liabilityTypes: {},
    allocation: { cash: 20, stock: 80 },
    snapshots: [
      { asOf: '2025-01-15T00:00:00.000Z', assets: [{ id: 'legacy-january', name: 'Broker ETF', type: 'stock', value: 100 }], liabilities: [] },
      { asOf: '2025-02-15T00:00:00.000Z', assets: [{ id: 'legacy-february', name: 'Broker ETF', type: 'stock', value: 120 }], liabilities: [] },
    ],
  });

  assert.equal(upgraded.version, 10);
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.mode, 'target');
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.categories.stock.target, 80);
  assert.equal(upgraded.snapshots[0].assets[0].id, 'legacy-january');
  assert.equal(upgraded.snapshots[1].assets[0].id, 'legacy-january');
  assert.equal(upgraded.snapshots[1].assets[0].portfolioScope, 'financial');
});

test('upgradePortfolio preserves a stable ID when an asset fingerprint changes', () => {
  const portfolio = {
    ...DEFAULT_PORTFOLIO,
    snapshots: [
      { asOf: '2025-01-15T00:00:00.000Z', assets: [{ id: 'asset-stable', name: 'Broker ETF', type: 'stock', description: 'Old description', value: 100 }], liabilities: [] },
      { asOf: '2025-02-15T00:00:00.000Z', assets: [{ id: 'asset-stable', name: 'Renamed ETF', type: 'stock', description: 'New description', value: 120 }], liabilities: [] },
    ],
  };

  const upgraded = upgradePortfolio(portfolio);
  assert.equal(upgraded.snapshots[0].assets[0].id, 'asset-stable');
  assert.equal(upgraded.snapshots[1].assets[0].id, 'asset-stable');
});

test('convertV6ToV7 infers scopes before the v8 cleanup', () => {
  const converted = convertV6ToV7({
    version: 6,
    currency: 'EUR',
    assetTypes: {
      cash: { name: 'Cash', dimensionRules: {} },
      stock: { name: 'Stock', dimensionRules: {} },
      collectible: { name: 'Collectible', dimensionRules: {} },
    },
    liabilityTypes: { loan: { name: 'Loan' } },
    dimensions: {},
    strategy: {},
    snapshots: [{
      asOf: '2025-01-15T00:00:00.000Z',
      assets: [
        { id: 'cash-1', name: 'Bank', type: 'cash', value: 50, isCheckingAccount: true },
        { id: 'stock-1', name: 'ETF', type: 'stock', value: 100, eligibleForInvestment: true },
        { id: 'art-1', name: 'Art', type: 'collectible', value: 400 },
      ],
      liabilities: [],
    }],
  });

  assert.equal(converted.version, 7);
  assert.equal(converted.snapshots[0].assets.find((asset) => asset.id === 'cash-1').portfolioScope, 'investable');
  assert.equal(converted.snapshots[0].assets.find((asset) => asset.id === 'stock-1').portfolioScope, 'financial');
  assert.equal(converted.snapshots[0].assets.find((asset) => asset.id === 'art-1').scopeNeedsReview, true);
  assert.equal(upgradePortfolio(converted).version, 10);
});

test('convertV7ToV8 removes obsolete data and preserves active history', () => {
  const converted = convertV7ToV8({
    version: 7,
    currency: 'EUR',
    assetTypes: { stock: { name: 'Stock', scopeRule: { mode: 'default', value: 'financial' }, dimensionRules: {} } },
    liabilityTypes: { loan: { name: 'Loan' } },
    dimensions: {},
    strategy: {},
    incomeRecords: [{ id: 'income-1', year: 2025, dividends: 10 }],
    liabilities: [{ id: 'loan-1', name: 'Loan', type: 'loan', value: 8, priority: true }],
    snapshots: [
      {
        asOf: '2025-01-15T00:00:00.000Z',
        contributions: 20,
        withdrawals: 5,
        assets: [{ id: 'stock-1', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 100, status: 'active', acquiredOn: '2020-01-01', costBasis: 80, notes: 'legacy' }],
        liabilities: [{ id: 'loan-1', name: 'Loan', type: 'loan', value: 10, priority: true }],
      },
      {
        asOf: '2025-02-15T00:00:00.000Z',
        contributions: 0,
        withdrawals: 0,
        assets: [{ id: 'stock-1', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 0, status: 'sold', acquiredOn: '2020-01-01', costBasis: 0, notes: 'sold' }],
        liabilities: [{ id: 'loan-1', name: 'Loan', type: 'loan', value: 8, priority: false }],
      },
    ],
  });

  assert.equal(converted.version, 8);
  assert.equal('incomeRecords' in converted, false);
  assert.equal('liabilities' in converted, false);
  assert.equal('contributions' in converted.snapshots[0], false);
  assert.equal('withdrawals' in converted.snapshots[0], false);
  assert.equal(converted.snapshots[0].assets.length, 1);
  assert.equal(converted.snapshots[1].assets.length, 0);
  for (const field of ['status', 'acquiredOn', 'costBasis', 'notes']) {
    assert.equal(field in converted.snapshots[0].assets[0], false);
  }
  assert.deepEqual(converted.snapshots[0].liabilities[0], { id: 'loan-1', name: 'Loan', type: 'loan', description: '', value: 10 });
  const upgraded = upgradePortfolio(converted);
  assert.equal(upgraded.version, 10);
  assert.equal(upgraded.snapshots[0].asOf, converted.snapshots[0].asOf);
  assert.equal(upgraded.snapshots[0].assets[0].value, converted.snapshots[0].assets[0].value);
});

test('convertV8ToV9 removes asset valuation dates without losing snapshot history', () => {
  const legacy = {
    version: 8,
    currency: 'EUR',
    assetTypes: { stock: { name: 'Stock', scopeRule: { mode: 'default', value: 'financial' }, dimensionRules: {} } },
    liabilityTypes: {},
    dimensions: {},
    strategy: {},
    snapshots: [{
      asOf: '2025-01-15T00:00:00.000Z',
      assets: [{ id: 'stock-1', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 100, valuationDate: '2025-01-14' }],
      liabilities: [],
    }],
  };
  const converted = convertV8ToV9(legacy);

  assert.equal(converted.version, 9);
  assert.equal(converted.snapshots[0].asOf, '2025-01-15T00:00:00.000Z');
  assert.equal(converted.snapshots[0].assets[0].value, 100);
  assert.equal('valuationDate' in converted.snapshots[0].assets[0], false);
  assert.equal(legacy.snapshots[0].assets[0].valuationDate, '2025-01-14');
  assert.equal(upgradePortfolio(legacy).version, 10);
  assert.equal(upgradePortfolio(converted).version, 10);
});

test('convertV9ToV10 initializes reserve routing and infers one financial cash destination', () => {
  const legacy = {
    version: 9,
    currency: 'EUR',
    assetTypes: { cash: { name: 'Cash', scopeRule: { mode: 'default', value: 'investable' }, dimensionRules: {} } },
    liabilityTypes: {},
    dimensions: {},
    strategy: { cashReserveTarget: 5000 },
    snapshots: [{
      asOf: '2026-01-15T00:00:00.000Z',
      assets: [
        { id: 'checking-1', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 6000, isCheckingAccount: true },
        { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 500, isCheckingAccount: false },
      ],
      liabilities: [],
    }],
  };
  const converted = convertV9ToV10(legacy);

  assert.equal(converted.version, 10);
  assert.equal(converted.snapshots[0].asOf, legacy.snapshots[0].asOf);
  assert.equal(converted.snapshots[0].assets[0].reserveToKeep, '');
  assert.equal(converted.snapshots[0].assets[0].isInvestmentCashAccount, false);
  assert.equal(converted.snapshots[0].assets[1].isInvestmentCashAccount, true);
  assert.equal('reserveToKeep' in legacy.snapshots[0].assets[0], false);
  assert.deepEqual(upgradePortfolio(legacy), converted);
  assert.deepEqual(upgradePortfolio(converted), converted);
});

test('upgradePortfolio preserves stored historical scopes when type rules later change', () => {
  const upgraded = upgradePortfolio({
    ...DEFAULT_PORTFOLIO,
    assetTypes: { stock: { name: 'Stock', scopeRule: { mode: 'locked', value: 'total' }, dimensionRules: {} } },
    snapshots: [{
      asOf: '2026-01-15T00:00:00.000Z',
      assets: [{ id: 'etf-1', name: 'ETF', type: 'stock', portfolioScope: 'financial', value: 100 }],
      liabilities: [],
    }],
  });
  assert.equal(upgraded.snapshots[0].assets[0].portfolioScope, 'financial');
});
