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
