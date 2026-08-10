import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import ConfigPage from './ConfigPage.jsx';
import { cloneDefaults, defaultAssetTypes, defaultDimensions, defaultLiabilityTypes, defaultStrategy } from '../data.js';

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  return dom;
}

function props(overrides = {}) {
  return {
    assetTypes: cloneDefaults(defaultAssetTypes),
    setAssetTypes: () => {},
    liabilityTypes: cloneDefaults(defaultLiabilityTypes),
    setLiabilityTypes: () => {},
    currency: 'EUR',
    setCurrency: () => {},
    dimensions: cloneDefaults(defaultDimensions),
    setDimensions: () => {},
    strategy: cloneDefaults(defaultStrategy),
    setStrategy: () => {},
    assets: [],
    liabilities: [],
    onEditJson: () => {},
    onExportBackup: () => {},
    onImportBackup: () => {},
    onDone: () => {},
    onReviewScopes: () => {},
    ...overrides,
  };
}

test('ConfigPage navigates sections and exposes a mobile section selector', async () => {
  const dom = setupDom();
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(ConfigPage, props({ dirty: true }))));
  assert.match(document.body.textContent, /Unsaved portfolio changes/);
  const strategyButton = Array.from(document.querySelectorAll('nav button')).find((button) => button.textContent.includes('Strategy'));
  await act(async () => strategyButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.equal(strategyButton.getAttribute('aria-current'), 'page');
  assert.ok(Array.from(document.querySelectorAll('main h2')).some((heading) => heading.textContent === 'Strategy'));
  const mobileSelect = Array.from(document.querySelectorAll('select')).find((select) => Array.from(select.options).some((option) => option.value === 'views'));
  await act(async () => {
    mobileSelect.value = 'views';
    mobileSelect.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
  assert.ok(Array.from(document.querySelectorAll('main h2')).some((heading) => heading.textContent === 'Portfolio Views'));
  root.unmount();
  dom.window.close();
});

test('ConfigPage reports strategy validation and Drive availability', async () => {
  const dom = setupDom();
  const strategy = cloneDefaults(defaultStrategy);
  strategy.dimensionPolicies.asset_type = {
    mode: 'target',
    tolerance: 2,
    importance: 3,
    categories: { stock: { target: 80 } },
  };
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(ConfigPage, props({ strategy, driveConfigured: true, driveAvailable: false }))));
  const strategyButton = Array.from(document.querySelectorAll('nav button')).find((button) => button.textContent.includes('Strategy'));
  assert.match(strategyButton.textContent, /1/);
  const dataButton = Array.from(document.querySelectorAll('nav button')).find((button) => button.textContent.includes('Data & Integrations'));
  await act(async () => dataButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.match(document.querySelector('main').textContent, /Unavailable/);
  assert.match(document.querySelector('main').textContent, /Drive operations are disabled/);
  assert.match(document.querySelector('main').textContent, /Export backup/);
  assert.match(document.querySelector('main').textContent, /Import backup/);
  root.unmount();
  dom.window.close();
});
