import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import AssetTable from './AssetTable.jsx';

function currentValueCell(props) {
  const markup = renderToStaticMarkup(React.createElement(AssetTable, {
    assets: [{ id: 'asset-current', name: 'Broker ETF', type: 'stock', value: 120 }],
    prevAssets: [],
    setAssets: () => {},
    assetTypes: { stock: { name: 'Stock' } },
    currency: 'EUR',
    readOnly: true,
    ...props,
  }));
  const dom = new JSDOM(markup);
  return dom.window.document.querySelector('tbody tr td:nth-child(5)');
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
