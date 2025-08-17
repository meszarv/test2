import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
require('@babel/register')({
  extensions: ['.js', '.jsx'],
  presets: [['@babel/preset-react', { runtime: 'automatic' }]],
});

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  return dom;
}

test('renders with all-positive series', async () => {
  const LineChart = require('./LineChart.jsx').default;
  setupDom();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const data = [
    { label: '2023-01-01', value: 1 },
    { label: '2023-02-01', value: 2 },
  ];
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(LineChart, { data }));
  });
  assert.ok(container.querySelector('canvas'));
});

test('renders with all-negative series', async () => {
  const LineChart = require('./LineChart.jsx').default;
  setupDom();
  const container = document.createElement('div');
  document.body.appendChild(container);
  const data = [
    { label: '2023-01-01', value: -1 },
    { label: '2023-02-01', value: -2 },
  ];
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(LineChart, { data }));
  });
  assert.ok(container.querySelector('canvas'));
});
