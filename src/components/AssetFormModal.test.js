import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AssetFormModal from './AssetFormModal.jsx';
import { cloneDefaults, defaultDimensions } from '../data.js';

function renderForm({ asset, scopeRule }) {
  return renderToStaticMarkup(React.createElement(AssetFormModal, {
    open: true,
    asset,
    assetTypes: { stock: { name: 'Stock', scopeRule, dimensionRules: {} } },
    dimensions: cloneDefaults(defaultDimensions),
    currency: 'EUR',
    onSave: () => {},
    onClose: () => {},
  }));
}

function scopeSelect(markup) {
  const dom = new JSDOM(markup);
  return Array.from(dom.window.document.querySelectorAll('select')).find((select) =>
    Array.from(select.options).some((option) => option.textContent === 'Total only')
  );
}

test('AssetFormModal shows migration review warning and disables a locked scope', () => {
  const markup = renderForm({
    asset: {
      id: 'stock-1',
      name: 'ETF',
      type: 'stock',
      portfolioScope: 'financial',
      scopeNeedsReview: true,
      ownershipShare: 100,
      value: 100,
    },
    scopeRule: { mode: 'locked', value: 'financial' },
  });
  assert.match(markup, /Review this asset’s portfolio scope/);
  const select = scopeSelect(markup);
  assert.ok(select);
  assert.equal(select.disabled, true);
  assert.equal(select.value, 'financial');
});

test('AssetFormModal applies an asset-type scope default to new assets', () => {
  const markup = renderForm({ asset: null, scopeRule: { mode: 'default', value: 'financial' } });
  const document = new JSDOM(markup).window.document;
  const select = scopeSelect(markup);
  assert.ok(select);
  assert.equal(select.disabled, false);
  assert.equal(select.value, 'financial');
  assert.ok(document.querySelector('select[aria-label="Geography category"]'));
  assert.equal(Array.from(document.querySelectorAll('button')).some((button) => button.getAttribute('aria-expanded') != null && button.textContent.includes('Concentration details')), false);
  assert.doesNotMatch(markup, /Cost basis|acquisition date|Valuation date|Valuation notes|Status/);
});

test('AssetFormModal exposes checking reserve and investment cash roles for cash assets', () => {
  const markup = renderToStaticMarkup(React.createElement(AssetFormModal, {
    open: true,
    asset: {
      id: 'cash-1',
      name: 'Checking',
      type: 'cash',
      portfolioScope: 'investable',
      ownershipShare: 100,
      value: 5000,
      isCheckingAccount: true,
      reserveToKeep: 2000,
    },
    assetTypes: { cash: { name: 'Cash', scopeRule: { mode: 'default', value: 'investable' }, dimensionRules: {} } },
    dimensions: cloneDefaults(defaultDimensions),
    currency: 'EUR',
    onSave: () => {},
    onClose: () => {},
  }));

  assert.match(markup, /Cash-reserve checking account/);
  assert.match(markup, /Reserve to keep \(EUR\)/);
  assert.match(markup, /Investment cash destination/);
  assert.match(markup, /Equal share of remaining reserve/);
});

test('saving an asset confirms and clears its migration review marker', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  let saved;
  const root = createRoot(document.getElementById('root'));
  await act(async () => {
    root.render(React.createElement(AssetFormModal, {
      open: true,
      asset: {
        id: 'stock-1',
        name: 'ETF',
        type: 'stock',
        portfolioScope: 'financial',
        scopeNeedsReview: true,
        ownershipShare: 100,
        value: 100,
      },
      assetTypes: { stock: { name: 'Stock', scopeRule: { mode: 'default', value: 'financial' }, dimensionRules: {} } },
      dimensions: cloneDefaults(defaultDimensions),
      currency: 'EUR',
      onSave: (asset) => { saved = asset; },
      onClose: () => {},
    }));
  });
  await act(async () => {
    document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  });
  assert.equal(saved.scopeNeedsReview, false);
  root.unmount();
  dom.window.close();
});
