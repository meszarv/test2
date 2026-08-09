import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import PortfolioScopeFilter from './PortfolioScopeFilter.jsx';

test('PortfolioScopeFilter renders independent switches for exact asset scopes', () => {
  const markup = renderToStaticMarkup(React.createElement(PortfolioScopeFilter, {
    values: ['total', 'financial'],
    onToggle: () => {},
    title: 'Asset scopes',
    description: 'Filter holdings.',
  }));
  const document = new JSDOM(markup).window.document;
  const switches = [...document.querySelectorAll('[role="switch"]')];
  const tracks = [...document.querySelectorAll('[data-switch-track]')];

  assert.deepEqual(switches.map((button) => button.textContent.trim()), ['Total only', 'Investable only', 'Financial Portfolio']);
  assert.deepEqual(switches.map((button) => button.getAttribute('aria-checked')), ['true', 'false', 'true']);
  assert.ok(tracks.every((track) => track.classList.contains('inline-block') && track.classList.contains('shrink-0')));
});
