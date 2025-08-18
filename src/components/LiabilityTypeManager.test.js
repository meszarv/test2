import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { createRequire } from 'module';
import Module from 'module';
import { readFileSync } from 'node:fs';
import { transformSync } from '@babel/core';
import presetReact from '@babel/preset-react';
import transformModules from '@babel/plugin-transform-modules-commonjs';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import TestUtils from 'react-dom/test-utils';
const { act } = TestUtils;

Module._extensions['.jsx'] = (mod, filename) => {
  const src = readFileSync(filename, 'utf8');
  const { code } = transformSync(src, {
    presets: [[presetReact, { runtime: 'automatic' }]],
    plugins: [transformModules],
    filename,
  });
  mod._compile(code, filename);
};
const require = createRequire(import.meta.url);

function render(component, props) {
  return renderToStaticMarkup(React.createElement(component, props));
}

function setupDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  return dom;
}

test('LiabilityTypeManager renders and reflects renamed types', () => {
  const LiabilityTypeManager = require('./LiabilityTypeManager.jsx').default;
  const initial = { loan: { name: 'Loan' } };
  const markup1 = render(LiabilityTypeManager, { liabilityTypes: initial, setLiabilityTypes: () => {}, liabilities: [] });
  assert.match(markup1, /Loan/);
  const renamed = { loan: { name: 'Debt' } };
  const markup2 = render(LiabilityTypeManager, { liabilityTypes: renamed, setLiabilityTypes: () => {}, liabilities: [] });
  assert.match(markup2, /Debt/);
});

test('LiabilityTypeManager can add types', async () => {
  const dom = setupDom();
  const LiabilityTypeManager = require('./LiabilityTypeManager.jsx').default;
  const container = document.createElement('div');
  document.body.appendChild(container);
  let updated = null;
  const root = createRoot(container);
  await act(async () => {
    root.render(
      React.createElement(LiabilityTypeManager, {
        liabilityTypes: { loan: { name: 'Loan' } },
        setLiabilityTypes: (t) => {
          updated = t;
        },
        liabilities: [],
      })
    );
  });
  window.prompt = () => 'New type';
  const addBtn = container.querySelector('button[title="Add type"]');
  await act(async () => {
    addBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  });
  assert.equal(Object.keys(updated).length, 2);
});

test('LiabilityTypeManager prevents removing types in use', async () => {
  const dom = setupDom();
  const LiabilityTypeManager = require('./LiabilityTypeManager.jsx').default;
  const container = document.createElement('div');
  document.body.appendChild(container);
  let called = false;
  let alertCalled = false;
  window.alert = () => {
    alertCalled = true;
  };
  global.alert = window.alert;
  const root = createRoot(container);
  await act(async () => {
    root.render(
      React.createElement(LiabilityTypeManager, {
        liabilityTypes: { loan: { name: 'Loan' } },
        setLiabilityTypes: () => {
          called = true;
        },
        liabilities: [{ id: '1', type: 'loan' }],
      })
    );
  });
  const delBtn = container.querySelector('button[title="Delete"]');
  await act(async () => {
    delBtn.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  });
  assert.equal(called, false);
  assert.equal(alertCalled, true);
});
