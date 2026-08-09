import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import PortfolioTotals from './PortfolioTotals.jsx';

test('PortfolioTotals presents overview metrics and the required cash reserve', () => {
  const markup = renderToStaticMarkup(React.createElement(PortfolioTotals, {
    metrics: {
      totalNetWorth: 90,
      totalAssets: 100,
      totalLiabilities: 10,
      investableAssets: 70,
      financialPortfolio: 50,
    },
    requiredCashReserve: 20,
    currency: 'EUR',
  }));
  const document = new JSDOM(markup).window.document;
  const text = document.body.textContent;

  for (const label of ['Net Worth', 'Total Assets', 'Liabilities', 'Investable Assets', 'Financial Portfolio', 'Required Cash Reserve']) {
    assert.match(text, new RegExp(label));
  }
  assert.match(text, /€20/);
  assert.doesNotMatch(text, /Available to Invest/);
});
