import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { JSDOM } from 'jsdom';
import { renderToStaticMarkup } from 'react-dom/server';
import { defaultAssetTypes, defaultDimensions, mergeStrategy, recommendSurplusCash } from '../data.js';
import SurplusPlan from './SurplusPlan.jsx';

test('SurplusPlan shows reserve assignments and ordered account transfers', () => {
  const assets = [
    { id: 'checking-a', name: 'Checking A', type: 'cash', portfolioScope: 'investable', value: 3000, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: 5000 },
    { id: 'checking-b', name: 'Checking B', type: 'cash', portfolioScope: 'investable', value: 7000, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: '' },
    { id: 'checking-c', name: 'Checking C', type: 'cash', portfolioScope: 'investable', value: 3500, ownershipShare: 100, isCheckingAccount: true, reserveToKeep: '' },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 1000, ownershipShare: 100, isInvestmentCashAccount: true },
  ];
  const strategy = { cashReserveTarget: 12000, dimensionPolicies: {} };
  const recommendation = recommendSurplusCash(assets, strategy, {}, defaultDimensions);
  const markup = renderToStaticMarkup(React.createElement(SurplusPlan, {
    recommendation,
    assets,
    strategy,
    assetTypes: {},
    dimensions: defaultDimensions,
    currency: 'EUR',
  }));
  const document = new JSDOM(markup).window.document;
  const text = document.body.textContent;

  assert.match(text, /Checking-account reserves/);
  assert.match(text, /Checking ASpecified/);
  assert.match(text, /Checking BEqual share/);
  assert.match(text, /Cash transfers — do these first/);
  assert.match(text, /Checking BChecking AReplenish reserve/);
  assert.match(text, /Checking BInvestment cashFund investment cash/);
});

test('SurplusPlan explains retained cash and still shows the projected strategy effect', () => {
  const assets = [
    { id: 'checking', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 10, ownershipShare: 100, isCheckingAccount: true },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 0, ownershipShare: 100, isInvestmentCashAccount: true },
    { id: 'stock', name: 'Stock ETF', type: 'stock', portfolioScope: 'financial', value: 100, ownershipShare: 100, eligibleForInvestment: true },
  ];
  const strategy = mergeStrategy({
    dimensionPolicies: {
      asset_type: {
        mode: 'target',
        tolerance: 10,
        importance: 3,
        categories: { stock: { target: 100 } },
      },
    },
  });
  const recommendation = recommendSurplusCash(assets, strategy, defaultAssetTypes, defaultDimensions);
  const markup = renderToStaticMarkup(React.createElement(SurplusPlan, {
    recommendation,
    assets,
    strategy,
    assetTypes: defaultAssetTypes,
    dimensions: defaultDimensions,
    currency: 'EUR',
  }));
  const text = new JSDOM(markup).window.document.body.textContent;

  assert.match(text, /remains in the investment cash account/);
  assert.match(text, /Projected strategy effect/);
  assert.doesNotMatch(text, /Next investment/);
});

test('SurplusPlan identifies configured rules that a buy-only plan cannot resolve', () => {
  const assets = [
    { id: 'checking', name: 'Checking', type: 'cash', portfolioScope: 'investable', value: 10, ownershipShare: 100, isCheckingAccount: true },
    { id: 'investment-cash', name: 'Investment cash', type: 'cash', portfolioScope: 'financial', value: 0, ownershipShare: 100, isInvestmentCashAccount: true },
    { id: 'stock', name: 'Stock ETF', type: 'stock', portfolioScope: 'financial', value: 100, ownershipShare: 100, eligibleForInvestment: false },
  ];
  const strategy = mergeStrategy({
    dimensionPolicies: {
      asset_type: {
        mode: 'target',
        tolerance: 0,
        importance: 3,
        categories: { stock: { target: 100 } },
      },
    },
  });
  const recommendation = recommendSurplusCash(assets, strategy, defaultAssetTypes, defaultDimensions);
  const markup = renderToStaticMarkup(React.createElement(SurplusPlan, {
    recommendation,
    assets,
    strategy,
    assetTypes: defaultAssetTypes,
    dimensions: defaultDimensions,
    currency: 'EUR',
  }));
  const text = new JSDOM(markup).window.document.body.textContent;

  assert.match(text, /1 configured strategy rule remains/);
  assert.match(text, /Asset type · Stock: Under target at 90.9% \(target 100%\)/);
});
