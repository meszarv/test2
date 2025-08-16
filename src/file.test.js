import test from 'node:test';
import assert from 'node:assert/strict';
import { upgradePortfolio, DEFAULT_PORTFOLIO, readPortfolioFile, writePortfolioFile } from './file.js';
import { netWorth } from './data.js';

test('netWorth subtracts liabilities from assets', () => {
  const assets = [{ value: 100 }, { value: 50 }];
  const liabilities = [{ value: 80 }];
  assert.equal(netWorth(assets, liabilities), 70);
});

test('upgradePortfolio adds currency and bumps version', () => {
  const old = { version: 1, assetTypes: {}, allocation: {}, snapshots: [] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.equal(upgraded.currency, DEFAULT_PORTFOLIO.currency);
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
  assert.deepEqual(upgraded.liabilities, old.liabilities);
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
    liabilities: [{ id: 'l1', name: 'Loan', type: 'loan', value: 500 }],
    snapshots: [
      { asOf: '2024-01-01', assets: [], liabilities: [{ id: 'l1', type: 'loan', value: 500 }] },
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
