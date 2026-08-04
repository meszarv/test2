import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LiabilityTable from './LiabilityTable.jsx';

function render(component, props) {
  return renderToStaticMarkup(React.createElement(component, props));
}

test('LiabilityTable lists liabilities and types', () => {
  const liabilities = [
    { id: '1', name: 'Loan A', type: 'loan', description: 'desc', value: 100, priority: true },
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
  assert.match(markup, /type="checkbox"/);
  assert.match(markup, /checked/);
});
