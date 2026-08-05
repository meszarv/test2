import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import Modal from './Modal.jsx';

test('modal keeps header and footer separate and confirms dirty Escape close', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = { userAgent: 'node.js' };
  global.HTMLElement = dom.window.HTMLElement;
  let closed = false;
  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Modal, {
    open: true,
    title: 'Edit record',
    dirty: true,
    onClose: () => { closed = true; },
    primaryAction: React.createElement('button', { type: 'button' }, 'Save'),
  }, React.createElement('div', null, 'Scrollable content'))));
  assert.equal(document.querySelector('header h2').textContent, 'Edit record');
  assert.match(document.querySelector('footer').textContent, /Cancel/);
  await act(async () => window.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  assert.match(document.body.textContent, /Discard unsaved changes/);
  assert.equal(closed, false);
  const discard = Array.from(document.querySelectorAll('button')).find((button) => button.textContent === 'Discard changes');
  await act(async () => discard.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true })));
  assert.equal(closed, true);
  root.unmount();
  dom.window.close();
});
