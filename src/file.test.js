import test from 'node:test';
import assert from 'node:assert/strict';
import { upgradePortfolio, DEFAULT_PORTFOLIO } from './file.js';

test('upgradePortfolio adds currency and bumps version', () => {
  const old = { version: 1, assetTypes: {}, allocation: {}, snapshots: [] };
  const upgraded = upgradePortfolio(old);
  assert.equal(upgraded.version, DEFAULT_PORTFOLIO.version);
  assert.equal(upgraded.currency, DEFAULT_PORTFOLIO.currency);
});
