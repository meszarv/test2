import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import ConcentrationPanel from './ConcentrationPanel.jsx';

test('ConcentrationPanel shows every dimension as a chart and synchronizes table details', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  const { createRoot } = await import('react-dom/client');

  const dimensions = {
    geography: { name: 'Geography', values: { europe: { name: 'Europe' } } },
    sector: { name: 'Sector', values: { technology: { name: 'Technology' } } },
  };
  const assetTypes = { stock: { name: 'Stock', dimensionRules: {} } };
  const assets = [{
    id: 'stock-1',
    name: 'ETF',
    type: 'stock',
    value: 100,
    fxRate: 1,
    ownershipShare: 100,
    portfolioScope: 'financial',
    ownership: 'personal',
    dimensions: { geography: { europe: 100 }, sector: { technology: 100 } },
  }];
  const strategy = {
    dimensionPolicies: {
      asset_type: { mode: 'informational', categories: {} },
      geography: { mode: 'informational', categories: {} },
      sector: { mode: 'informational', categories: {} },
    },
  };

  function Harness() {
    const [selectedDimension, setSelectedDimension] = useState('asset_type');
    return React.createElement(React.Fragment, null,
      React.createElement(ConcentrationPanel, {
        assets,
        assetTypes,
        dimensions,
        strategy,
        currency: 'EUR',
        selectedDimension,
        onSelectDimension: setSelectedDimension,
        portfolioView: 'total',
      }),
      React.createElement('output', null, selectedDimension),
    );
  }

  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Harness)));
  assert.equal(document.querySelectorAll('[data-concentration-chart]').length, 3);
  assert.deepEqual(
    [...document.querySelectorAll('[data-concentration-chart] canvas')].map((canvas) => canvas.getAttribute('aria-label')),
    ['Asset type concentration pie chart', 'Geography concentration pie chart', 'Sector concentration pie chart'],
  );
  assert.equal(document.querySelector('button[aria-label="Show Asset type details"]').getAttribute('aria-pressed'), 'true');
  assert.match(document.querySelector('table').textContent, /Stock/);

  await act(async () => document.querySelector('button[aria-label="Show Geography details"]').click());
  assert.equal(document.querySelector('output').textContent, 'geography');
  assert.equal(document.querySelector('select').value, 'geography');
  assert.equal(document.querySelector('button[aria-label="Show Geography details"]').getAttribute('aria-pressed'), 'true');
  assert.match(document.querySelector('table').textContent, /Europe/);

  await act(async () => root.unmount());
  dom.window.close();
});
