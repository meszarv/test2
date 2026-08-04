import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { upgradePortfolio, DEFAULT_PORTFOLIO, readPortfolioFile, writePortfolioFile } from './file.js';
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

test('upgradePortfolio converts v5 allocation and asset observations to v6', () => {
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
  assert.equal(upgraded.version, 6);
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.mode, 'target');
  assert.equal(upgraded.strategy.dimensionPolicies.asset_type.categories.stock.target, 80);
  assert.equal(upgraded.snapshots[0].assets[0].id, upgraded.snapshots[1].assets[0].id);
  assert.equal(upgraded.snapshots[1].assets[0].ownershipShare, 100);
  assert.deepEqual(upgraded.incomeRecords, []);
});
