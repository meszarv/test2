import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import DimensionExposureEditor from './DimensionExposureEditor.jsx';

const definition = {
  name: 'Geography',
  values: {
    europe: { name: 'Europe' },
    north_america: { name: 'North America' },
    global: { name: 'Global / diversified' },
  },
};

test('single-category exposure uses a direct selector and assigns 100%', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');

  function Harness() {
    const [value, setValue] = useState({ europe: 100 });
    return React.createElement(React.Fragment, null,
      React.createElement(DimensionExposureEditor, { definition, value, rule: { mode: 'user' }, onChange: setValue }),
      React.createElement('output', null, JSON.stringify(value)));
  }

  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Harness)));
  const select = document.querySelector('select');
  assert.equal(select.value, 'europe');
  assert.match(document.body.textContent, /Split allocation/);

  await act(async () => {
    select.value = 'north_america';
    select.dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  });
  assert.equal(document.querySelector('output').textContent, '{"north_america":100}');

  await act(async () => Array.from(document.querySelectorAll('button')).find((button) => button.textContent.includes('Split allocation')).click());
  assert.match(document.body.textContent, /Exposure %/);
  assert.match(document.body.textContent, /Use single category/);

  await act(async () => root.unmount());
  dom.window.close();
});

test('multi-category exposure stays summarized until Edit split is selected', () => {
  const markup = renderToStaticMarkup(React.createElement(DimensionExposureEditor, {
    definition,
    value: { europe: 60, north_america: 40 },
    rule: { mode: 'user' },
    onChange: () => {},
  }));
  const document = new JSDOM(markup).window.document;

  assert.match(document.body.textContent, /Europe 60% · North America 40%/);
  assert.match(document.body.textContent, /Edit split/);
  assert.equal(document.querySelectorAll('input').length, 0);
});

test('locked exposure is shown as a compact read-only value', () => {
  const markup = renderToStaticMarkup(React.createElement(DimensionExposureEditor, {
    definition,
    value: { global: 100 },
    rule: { mode: 'locked' },
    onChange: () => {},
  }));
  const document = new JSDOM(markup).window.document;

  assert.match(document.body.textContent, /Global \/ diversified/);
  assert.match(document.body.textContent, /Fixed by asset type/);
  assert.equal(document.querySelectorAll('select, input, button').length, 0);
});
