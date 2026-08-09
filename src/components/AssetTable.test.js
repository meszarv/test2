import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import AssetTable, { withAssetCurrentValue } from './AssetTable.jsx';

function currentValueCell(props) {
  const markup = renderToStaticMarkup(React.createElement(AssetTable, {
    assets: [{ id: 'asset-current', name: 'Broker ETF', type: 'stock', value: 120 }],
    prevAssets: [],
    assetTypes: { stock: { name: 'Stock' } },
    currency: 'EUR',
    readOnly: true,
    ...props,
  }));
  const dom = new JSDOM(markup);
  return dom.window.document.querySelector('tbody tr td:nth-child(3)');
}

test('AssetTable shows no delta when the previous snapshot has no matching asset ID', () => {
  const cell = currentValueCell({
    prevAssets: [{ id: 'different-legacy-id', name: 'Broker ETF', type: 'stock', value: 100 }],
  });

  assert.equal(cell.lastElementChild.textContent, '—');
  assert.equal(cell.lastElementChild.title, 'No matching asset in the previous snapshot');
});

test('AssetTable calculates the delta from a matching asset ID', () => {
  const cell = currentValueCell({
    prevAssets: [{ id: 'asset-current', name: 'Broker ETF', type: 'stock', value: 100 }],
  });

  assert.match(cell.lastElementChild.textContent, /^\+.*20/);
});

test('AssetTable contains only focused holding columns', () => {
  const markup = renderToStaticMarkup(React.createElement(AssetTable, {
    assets: [],
    prevAssets: [],
    assetTypes: {},
  }));

  assert.match(markup, /Current value/);
  assert.match(markup, /Portfolio role/);
  assert.doesNotMatch(markup, /Cost basis|Gain \/ loss|Quantity|Price \/ total/);
});

test('AssetTable renders an inline current-value editor only for the latest snapshot', () => {
  const props = {
    assets: [{ id: 'cash-1', name: 'Cash', type: 'cash', value: 120 }],
    prevAssets: [],
    setAssets: () => {},
    assetTypes: { cash: { name: 'Cash' } },
    currency: 'EUR',
  };
  const editable = new JSDOM(renderToStaticMarkup(React.createElement(AssetTable, props)));
  const historical = new JSDOM(renderToStaticMarkup(React.createElement(AssetTable, { ...props, readOnly: true })));

  assert.ok(editable.window.document.querySelector('tbody tr td:nth-child(3) input'));
  assert.equal(historical.window.document.querySelector('tbody tr td:nth-child(3) input'), null);
});

test('withAssetCurrentValue updates direct values and derives unit prices', () => {
  const direct = withAssetCurrentValue({ valuationMode: 'total', value: 100, fxRate: 1.2, ownershipShare: 50 }, 90);
  const units = withAssetCurrentValue({ valuationMode: 'units', quantity: 4, unitPrice: 10, fxRate: 1.2, ownershipShare: 50 }, 30);

  assert.equal(direct.value, 150);
  assert.equal(units.unitPrice, 12.5);
});
