import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import DimensionManager from './DimensionManager.jsx';

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  global.HTMLElement.prototype.attachEvent = () => {};
  return dom;
}

test('DimensionManager sorts values and protects referenced values', async () => {
  const dom = setupDom();
  const dimensions = {
    geography: { name: 'Geography', values: { europe: { name: 'Europe' }, global: { name: 'Global' } } },
    sector: { name: 'Sector', values: { diversified: { name: 'Diversified' } } },
  };
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(DimensionManager, {
    dimensions,
    setDimensions: () => {},
    assetTypes: {},
    assets: [{ id: 'a', dimensions: { geography: { europe: 100 } } }],
    strategy: { dimensionPolicies: {} },
  })));
  assert.match(Array.from(document.querySelectorAll('th'))[0].textContent, /▲/);
  const protectedDelete = document.querySelector('button[title="Cannot delete: 1 references"]');
  assert.equal(protectedDelete.disabled, true);
  const heading = Array.from(document.querySelectorAll('th')).find((cell) => cell.textContent.includes('Value'));
  await act(async () => heading.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.match(heading.textContent, /▼/);
  const sectorButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('Sector') && button.textContent.includes('1 values'));
  await act(async () => sectorButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  const dimensionName = Array.from(document.querySelectorAll('input')).find((input) => input.closest('label')?.textContent.includes('Dimension name'));
  assert.equal(dimensionName.value, 'Sector');
  root.unmount();
  dom.window.close();
});

test('DimensionManager adds a value to the selected dimension', async () => {
  const dom = setupDom();
  let updated;
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(DimensionManager, {
    dimensions: { geography: { name: 'Geography', values: {} } },
    setDimensions: (value) => { updated = value; },
    assetTypes: {},
    assets: [],
    strategy: { dimensionPolicies: {} },
    initialNewValue: 'Asia',
  })));
  await act(async () => document.querySelector('button[title="Add value"]').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  const addButton = Array.from(document.querySelectorAll('button')).find((button) => button.textContent.trim() === 'Add');
  await act(async () => addButton.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.ok(Object.values(updated.geography.values).some((value) => value.name === 'Asia'));
  root.unmount();
  dom.window.close();
});
