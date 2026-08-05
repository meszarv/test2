import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import AssetTypeManager from './AssetTypeManager.jsx';
import { cloneDefaults, defaultAssetTypes, defaultDimensions } from '../data.js';

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLElement.prototype.attachEvent = () => {};
  return dom;
}

test('AssetTypeManager selects details and protects types used by assets', async () => {
  const dom = setupDom();
  const assetTypes = cloneDefaults(defaultAssetTypes);
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(AssetTypeManager, {
    assetTypes,
    setAssetTypes: () => {},
    assets: [{ id: 'stock-1', type: 'stock' }],
    dimensions: cloneDefaults(defaultDimensions),
  })));
  const stockButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('Stock') && button.textContent.includes('1 assets'));
  await act(async () => stockButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  const nameInput = Array.from(document.querySelectorAll('input')).find((input) => input.closest('label')?.textContent.includes('Asset type name'));
  assert.equal(nameInput.value, 'Stock');
  const deleteButton = document.querySelector('button[title="Cannot delete a type used by assets"]');
  assert.equal(deleteButton.disabled, true);
  root.unmount();
  dom.window.close();
});

test('AssetTypeManager keeps the selected type visible when search has no matches', () => {
  const markup = renderToStaticMarkup(React.createElement(AssetTypeManager, {
    assetTypes: { cash: cloneDefaults(defaultAssetTypes.cash), stock: cloneDefaults(defaultAssetTypes.stock) },
    setAssetTypes: () => {},
    assets: [],
    dimensions: cloneDefaults(defaultDimensions),
    initialSearch: 'ZZZ',
  }));
  assert.match(markup, /No other matching asset types/);
  assert.match(markup, /Cash/);
});

test('AssetTypeManager adds a type and selects it', async () => {
  const dom = setupDom();
  let updated;
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(AssetTypeManager, {
    assetTypes: { cash: cloneDefaults(defaultAssetTypes.cash) },
    setAssetTypes: (value) => { updated = value; },
    assets: [],
    dimensions: cloneDefaults(defaultDimensions),
    initialNewName: 'Crypto',
  })));
  await act(async () => document.querySelector('button[title="Add type"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  const addButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim() === 'Add');
  await act(async () => addButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.ok(Object.values(updated).some((type) => type.name === 'Crypto'));
  root.unmount();
  dom.window.close();
});
