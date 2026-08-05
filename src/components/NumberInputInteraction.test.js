import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import NumberInput from './NumberInput.jsx';

test('numeric input cancels on Escape and commits on Enter', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');

  function Harness() {
    const [value, setValue] = useState(100);
    return React.createElement(React.Fragment, null,
      React.createElement(NumberInput, { label: 'Amount', kind: 'money', currency: 'EUR', value, onChange: setValue }),
      React.createElement('output', { id: 'committed' }, String(value)));
  }

  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Harness)));
  const input = document.querySelector('input');
  const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value').set;

  await act(async () => {
    input.focus();
    setter.call(input, '200');
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  });
  assert.equal(document.getElementById('committed').textContent, '100');

  await act(async () => {
    input.focus();
    setter.call(input, '250');
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
    input.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  });
  assert.equal(document.getElementById('committed').textContent, '250');
  await act(async () => root.unmount());
  dom.window.close();
});
