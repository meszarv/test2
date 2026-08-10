import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { cloneDefaults, defaultAssetTypes, defaultDimensions, defaultLiabilityTypes, defaultStrategy } from '../data.js';
import usePortfolioFile from './usePortfolioFile.js';

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const testDimensions = cloneDefaults(defaultDimensions);
const testStrategy = cloneDefaults(defaultStrategy);

function writableHandle() {
  return {
    async createWritable() {
      return { async write() {}, async close() {} };
    },
  };
}

test('a portfolio edit becomes dirty after an earlier edit was saved', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  const previousActEnvironment = global.IS_REACT_ACT_ENVIRONMENT;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const previousWarn = console.warn;
  console.warn = () => {};

  let portfolioFile;
  let editSnapshot;
  const initialSnapshot = { asOf: '2026-08-01T00:00:00.000Z', assets: [], liabilities: [] };
  function Harness() {
    const [snapshots, setSnapshots] = useState([initialSnapshot]);
    editSnapshot = () => setSnapshots((current) => current.map((snapshot) => ({ ...snapshot, asOf: new Date().toISOString() })));
    portfolioFile = usePortfolioFile({
      assets: [],
      setAssets: () => {},
      liabilities: [],
      setLiabilities: () => {},
      assetTypes: defaultAssetTypes,
      setAssetTypes: () => {},
      liabilityTypes: defaultLiabilityTypes,
      setLiabilityTypes: () => {},
      currency: 'EUR',
      setCurrency: () => {},
      dimensions: testDimensions,
      setDimensions: () => {},
      strategy: testStrategy,
      setStrategy: () => {},
      snapshots,
      setSnapshots,
      snapshotFromAssets: () => {},
      setCurrentIndex: () => {},
    });
    return React.createElement('output', { 'data-dirty': String(portfolioFile.dirty) });
  }

  const root = createRoot(document.getElementById('root'));
  try {
    await act(async () => root.render(React.createElement(Harness)));
    await act(async () => editSnapshot());
    assert.equal(portfolioFile.dirty, true);

    await act(async () => {
      portfolioFile.setFileHandle(writableHandle());
      portfolioFile.setPassword('password');
    });
    await act(async () => portfolioFile.handleSave());
    assert.equal(portfolioFile.dirty, false);

    await act(async () => editSnapshot());
    assert.equal(portfolioFile.dirty, true);
  } finally {
    await act(async () => root.unmount());
    console.warn = previousWarn;
    global.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    dom.window.close();
  }
});
