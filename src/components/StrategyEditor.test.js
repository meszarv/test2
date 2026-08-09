import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import StrategyEditor, { categoryConfiguredForMode } from './StrategyEditor.jsx';

const assetTypes = {
  cash: { name: 'Cash' },
  stock: { name: 'Stock' },
  bond: { name: 'Bond' },
};

function strategyWith(policy) {
  return {
    cashReserveTarget: 0,
    dimensionPolicies: { asset_type: policy },
  };
}

test('configured-only rules distinguish positive targets from explicit zero limits', () => {
  assert.equal(categoryConfiguredForMode({ target: 0 }, 'target'), false);
  assert.equal(categoryConfiguredForMode({ target: 25 }, 'target'), true);
  assert.equal(categoryConfiguredForMode({ min: '', max: '' }, 'limits'), false);
  assert.equal(categoryConfiguredForMode({ max: 0 }, 'limits'), true);

  const targetMarkup = renderToStaticMarkup(React.createElement(StrategyEditor, {
    strategy: strategyWith({
      mode: 'target',
      tolerance: 2,
      importance: 3,
      categories: { cash: { target: 0 }, stock: { target: 100 }, bond: {} },
    }),
    setStrategy: () => {},
    assetTypes,
    dimensions: {},
    currency: 'EUR',
    assets: [],
  }));
  const targetDocument = new JSDOM(targetMarkup).window.document;
  assert.ok(targetDocument.querySelector('[data-category-rule="stock"]'));
  assert.equal(targetDocument.querySelector('[data-category-rule="cash"]'), null);
  assert.equal(targetDocument.querySelector('[data-category-rule="bond"]'), null);
  assert.match(targetDocument.body.textContent, /Targets always total 100%/);
  assert.ok(targetDocument.querySelector('[data-target-allocation-bar]'));

  const fractionalMarkup = renderToStaticMarkup(React.createElement(StrategyEditor, {
    strategy: strategyWith({
      mode: 'target',
      tolerance: 2,
      importance: 3,
      categories: { stock: { target: 65.5 }, bond: { target: 24.5 }, cash: { target: 10 } },
    }),
    setStrategy: () => {},
    assetTypes,
    dimensions: {},
    currency: 'EUR',
    assets: [],
  }));
  const fractionalDocument = new JSDOM(fractionalMarkup).window.document;
  assert.equal(fractionalDocument.querySelector('[data-target-allocation-bar]'), null);
  assert.match(fractionalDocument.body.textContent, /Existing targets use decimal percentages/);
  assert.match(fractionalDocument.body.textContent, /Round to whole %/);

  const limitsMarkup = renderToStaticMarkup(React.createElement(StrategyEditor, {
    strategy: strategyWith({
      mode: 'limits',
      tolerance: 2,
      importance: 3,
      categories: { cash: { max: 0 }, stock: { min: '', max: '' } },
    }),
    setStrategy: () => {},
    assetTypes,
    dimensions: {},
    currency: 'EUR',
    assets: [],
  }));
  const limitsDocument = new JSDOM(limitsMarkup).window.document;
  assert.ok(limitsDocument.querySelector('[data-category-rule="cash"]'));
  assert.equal(limitsDocument.querySelector('[data-category-rule="stock"]'), null);
});

test('a category rule can be added and removed without showing every category', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');

  function Harness() {
    const [strategy, setStrategy] = useState(strategyWith({
      mode: 'target',
      tolerance: 2,
      importance: 3,
      categories: { stock: { target: 100 } },
    }));
    return React.createElement(React.Fragment, null,
      React.createElement(StrategyEditor, {
        strategy,
        setStrategy,
        assetTypes,
        dimensions: {},
        currency: 'EUR',
        assets: [],
      }),
      React.createElement('output', null, JSON.stringify(strategy.dimensionPolicies.asset_type.categories)),
    );
  }

  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Harness)));
  assert.equal(document.querySelectorAll('[data-category-rule]').length, 1);

  const categorySelect = document.querySelector('select[aria-label="Asset type category to add"]');
  await act(async () => {
    categorySelect.value = 'bond';
    categorySelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
  await act(async () => document.querySelector('button[aria-label="Add Asset type category"]').click());
  assert.ok(document.querySelector('[data-category-rule="bond"]'));
  assert.deepEqual(JSON.parse(document.querySelector('output').textContent), { stock: { target: 95 }, bond: { target: 5 } });

  await act(async () => document.querySelector('button[aria-label="Remove Stock target"]').click());
  assert.equal(document.querySelector('[data-category-rule="stock"]'), null);
  assert.equal(document.querySelectorAll('[data-category-rule]').length, 1);
  assert.deepEqual(JSON.parse(document.querySelector('output').textContent), { bond: { target: 100 } });
  assert.equal(document.querySelector('button[aria-label="Remove Bond target"]').disabled, true);

  await act(async () => root.unmount());
  dom.window.close();
});
