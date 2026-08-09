import test from 'node:test';
import assert from 'node:assert/strict';
import { withExclusiveInvestmentCash } from './useAssetManager.js';

test('withExclusiveInvestmentCash keeps exactly the newly selected destination', () => {
  const selected = { id: 'new-cash', isInvestmentCashAccount: true };
  const assets = withExclusiveInvestmentCash([
    { id: 'old-cash', isInvestmentCashAccount: true },
    selected,
    { id: 'stock', isInvestmentCashAccount: false },
  ], selected);

  assert.deepEqual(assets.map((asset) => [asset.id, asset.isInvestmentCashAccount]), [
    ['old-cash', false],
    ['new-cash', true],
    ['stock', false],
  ]);
});
