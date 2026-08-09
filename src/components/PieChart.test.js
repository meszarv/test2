import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import PieChart from './PieChart.jsx';

function renderChart(showTarget = false) {
  const markup = renderToStaticMarkup(React.createElement(PieChart, {
    data: { cash: 25, stock: 75, unused: 0 },
    targetData: { bond: 40, stock: 60 },
    showTarget,
    assetTypes: {
      stock: { name: 'Stocks' },
      cash: { name: 'Cash' },
      bond: { name: 'Bonds' },
    },
  }));
  return new JSDOM(markup).window.document;
}

test('PieChart renders a color legend for positive current values', () => {
  const document = renderChart();
  const items = [...document.querySelectorAll('[aria-label="Chart legend"] li')];

  assert.deepEqual(
    items.map((item) => [item.children[1].textContent, item.children[2].textContent]),
    [['Cash', '25%'], ['Stocks', '75%']]
  );
  assert.ok(items[0].querySelector('[aria-hidden="true"]').style.backgroundColor);
  assert.equal(document.querySelector('canvas').getAttribute('aria-label'), 'Current allocation pie chart');
});

test('PieChart legend follows the target allocation while target is shown', () => {
  const document = renderChart(true);
  const text = document.querySelector('[aria-label="Chart legend"]').textContent;

  assert.match(text, /Stocks\s*60%/);
  assert.match(text, /Bonds\s*40%/);
  assert.doesNotMatch(text, /Cash|unused/);
  assert.equal(document.querySelector('canvas').getAttribute('aria-label'), 'Target allocation pie chart');
});

test('PieChart keeps a category color stable across different data subsets and ordering', () => {
  const currentDocument = renderChart();
  const targetDocument = renderChart(true);
  const colorFor = (document, name) => [...document.querySelectorAll('[aria-label="Chart legend"] li')]
    .find((item) => item.children[1].textContent === name)
    .querySelector('[aria-hidden="true"]').style.backgroundColor;

  assert.equal(colorFor(currentDocument, 'Stocks'), colorFor(targetDocument, 'Stocks'));
  assert.notEqual(colorFor(currentDocument, 'Stocks'), colorFor(currentDocument, 'Cash'));
});
