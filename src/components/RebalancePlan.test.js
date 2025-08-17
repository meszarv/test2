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
  assert.equal(currentVal, 0);
  assert.equal(investVal, 40);
});

