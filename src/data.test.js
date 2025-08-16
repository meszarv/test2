import test from 'node:test';
import assert from 'node:assert/strict';
import { rebalance } from './data.js';

test('rebalance invests remaining cash after paying priority liabilities', () => {
  const assets = [
    { type: 'cash', value: 100 },
    { type: 'stock', value: 0 },
  ];
  const liabilities = [
    { type: 'loan', value: 80, priority: true },
  ];
  const { investPlan } = rebalance(assets, liabilities, { stock: 1 });
  assert.equal(Math.round(investPlan.stock), 20);
  assert.equal(Math.round(investPlan.cash), -20);
});
