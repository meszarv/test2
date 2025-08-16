import test from 'node:test';
import assert from 'node:assert/strict';
import { upgradePortfolio, DEFAULT_PORTFOLIO } from './file.js';

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

test('upgradePortfolio adds top-level liabilities and bumps version from v3', () => {
  const old = { version: 3, currency: 'USD', assetTypes: {}, liabilityTypes: {}, allocation: {}, snapshots: [] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.deepEqual(upgraded.liabilities, []);
});
