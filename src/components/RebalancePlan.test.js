import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('@babel/register')({ extensions: ['.js', '.jsx'], presets: ['@babel/preset-react'] });

test('priority debt appears negative and sorts before assets', async () => {
  const RebalancePlan = require('./RebalancePlan.jsx').default;
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;

  const container = document.createElement('div');
  document.body.appendChild(container);

  const data = {
    byCat: { cash: 100 },
    idealByCat: { cash: 100 },
    investPlan: { cash: 0 },
    priorityDebt: 50,
    totalNow: 100,
    targetTotal: 100,
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(RebalancePlan, { data, assetTypes: {} }));
  });

  const currentHeader = container.querySelector('th:nth-child(3)');
  await act(async () => {
    currentHeader.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  });

  const rows = container.querySelectorAll('tbody tr');
  assert.equal(rows.length, 2);
  const firstCells = rows[0].querySelectorAll('td');
  assert.equal(firstCells[1].textContent.trim(), 'Priority debt');
  assert.ok(firstCells[2].textContent.trim().startsWith('-'));
});

test('priority payoff appears only in invest column', async () => {
  const RebalancePlan = require('./RebalancePlan.jsx').default;
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;

  const container = document.createElement('div');
  document.body.appendChild(container);

  const data = {
    byCat: { cash: 100 },
    idealByCat: { cash: 100 },
    investPlan: { cash: 0 },
    priorityDebt: 0,
    priorityPayoff: 40,
    totalNow: 100,
    targetTotal: 100,
  };

  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(RebalancePlan, { data, assetTypes: {} }));
  });

  const row = Array.from(container.querySelectorAll('tbody tr')).find(
    (r) => r.querySelectorAll('td')[1].textContent.trim() === 'Priority debt'
  );
  assert.ok(row);
  const cells = row.querySelectorAll('td');
  const currentVal = parseFloat(cells[2].textContent.replace(/[^0-9.-]/g, ''));
  const investVal = parseFloat(cells[4].textContent.replace(/[^0-9.-]/g, ''));
  assert.equal(currentVal, -40);
  assert.equal(investVal, 40);
});

test('after column reflects post-investment balances', async () => {
  const RebalancePlan = require('./RebalancePlan.jsx').default;
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;

  const container = document.createElement('div');
  document.body.appendChild(container);

  const data = {
    byCat: { cash: 100 },
    idealByCat: { cash: 50, stock: 50 },
    investPlan: { cash: -50, stock: 50 },
    priorityDebt: 0,
    totalNow: 100,
    targetTotal: 100,
  };

  const assetTypes = { cash: { name: 'Cash' }, stock: { name: 'Stock' } };
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(RebalancePlan, { data, assetTypes }));
  });

  const rows = Array.from(container.querySelectorAll('tbody tr'));
  const cashRow = rows.find((r) => r.querySelectorAll('td')[1].textContent.trim() === 'Cash');
  const stockRow = rows.find((r) => r.querySelectorAll('td')[1].textContent.trim() === 'Stock');
  assert.ok(cashRow && stockRow);
  const cashAfter = parseFloat(cashRow.querySelectorAll('td')[5].textContent.replace(/[^0-9.-]/g, ''));
  const stockAfter = parseFloat(stockRow.querySelectorAll('td')[5].textContent.replace(/[^0-9.-]/g, ''));
  assert.equal(cashAfter, 50);
  assert.equal(stockAfter, 50);
});

