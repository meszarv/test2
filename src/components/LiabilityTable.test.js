import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'module';
import Module from 'module';
import { readFileSync } from 'node:fs';
import { transformSync } from '@babel/core';
import presetReact from '@babel/preset-react';

Module._extensions['.jsx'] = (mod, filename) => {
  const src = readFileSync(filename, 'utf8');
  const { code } = transformSync(src, {
    presets: [[presetReact, { runtime: 'automatic' }]],
    filename,
  });
  mod._compile(code, filename);
};
const require = createRequire(import.meta.url);

function render(component, props) {
  return renderToStaticMarkup(React.createElement(component, props));
}

test('LiabilityTable lists liabilities and types', () => {
  const LiabilityTable = require('./LiabilityTable.jsx').default;
  const liabilities = [
    { id: '1', name: 'Loan A', type: 'loan', description: 'desc', value: 100 },
  ];
  const markup = render(LiabilityTable, {
    liabilities,
    prevLiabilities: [],
    setLiabilities: () => {},
    liabilityTypes: { loan: { name: 'Loan' } },
    readOnly: true,
  });
  assert.match(markup, /Loan A/);
  assert.match(markup, /Loan/);
});
