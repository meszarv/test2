import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import PortfolioBackupModal from './PortfolioBackupModal.jsx';

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  return dom;
}

test('PortfolioBackupModal exports readable JSON without a password', async () => {
  const dom = setupDom();
  const root = createRoot(document.getElementById('root'));
  let exported;
  await act(async () => root.render(React.createElement(PortfolioBackupModal, {
    open: true,
    defaultPassword: 'current-password',
    onClose: () => {},
    onExport: async (format, password) => { exported = { format, password }; return true; },
  })));

  const jsonRadio = document.querySelector('input[value="json"]');
  await act(async () => jsonRadio.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));

  assert.deepEqual(exported, { format: 'json', password: '' });
  assert.match(document.body.textContent, /not encrypted/i);
  await act(async () => root.unmount());
  dom.window.close();
});

test('PortfolioBackupModal passes a selected backup file to import', async () => {
  const dom = setupDom();
  const root = createRoot(document.getElementById('root'));
  const selected = { name: 'portfolio.json' };
  let imported;
  await act(async () => root.render(React.createElement(PortfolioBackupModal, {
    open: true,
    initialMode: 'import',
    allowExport: false,
    onClose: () => {},
    onImport: async (file, password) => { imported = { file, password }; return true; },
  })));

  const input = document.querySelector('input[type="file"]');
  Object.defineProperty(input, 'files', { configurable: true, value: [selected] });
  await act(async () => input.dispatchEvent(new dom.window.Event('change', { bubbles: true })));
  await act(async () => document.querySelector('form').dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true })));

  assert.deepEqual(imported, { file: selected, password: '' });
  await act(async () => root.unmount());
  dom.window.close();
});
