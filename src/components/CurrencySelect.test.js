import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import CurrencySelect, { currencyError, normalizeCurrencyCode } from './CurrencySelect.jsx';

test('currency selector includes common and previously referenced currencies', () => {
  const markup = renderToStaticMarkup(React.createElement(CurrencySelect, {
    value: 'EUR',
    onChange: () => {},
    referencedCurrencies: ['SEK', 'USD'],
  }));
  assert.match(markup, /value="EUR"/);
  assert.match(markup, /value="SEK"/);
  assert.equal((markup.match(/value="USD"/g) || []).length, 1);
  assert.match(markup, /Other…/);
});

test('currency selector preserves a custom currency and validates codes', () => {
  const markup = renderToStaticMarkup(React.createElement(CurrencySelect, { value: 'SEK', onChange: () => {} }));
  assert.match(markup, /Custom currency code/);
  assert.match(markup, /value="SEK"/);
  assert.equal(normalizeCurrencyCode(' sek '), 'SEK');
  assert.equal(currencyError('SEK'), '');
  assert.match(currencyError('EU'), /three-letter/);
});
