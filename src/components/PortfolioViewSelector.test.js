import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import PortfolioViewSelector from './PortfolioViewSelector.jsx';

test('PortfolioViewSelector renders all portfolio scopes and marks the selected view', () => {
  const markup = renderToStaticMarkup(React.createElement(PortfolioViewSelector, {
    value: 'investable',
    onChange: () => {},
    title: 'Holdings view',
    description: 'Filter holdings.',
  }));
  const document = new JSDOM(markup).window.document;
  const buttons = [...document.querySelectorAll('button')];

  assert.deepEqual(buttons.map((button) => button.textContent), ['Total Net Worth', 'Investable Assets', 'Financial Portfolio']);
  assert.equal(buttons.find((button) => button.textContent === 'Investable Assets').getAttribute('aria-pressed'), 'true');
});
