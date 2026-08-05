import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SnapshotTabs, { hasSnapshotMonthConflict } from './SnapshotTabs.jsx';

const snapshots = [
  { asOf: '2026-06-01T00:00:00.000Z', assets: [], liabilities: [] },
  { asOf: '2026-07-01T00:00:00.000Z', assets: [], liabilities: [] },
];

test('snapshot month conflict excludes the snapshot being edited', () => {
  assert.equal(hasSnapshotMonthConflict(snapshots, 1, '2026-06'), true);
  assert.equal(hasSnapshotMonthConflict(snapshots, 1, '2026-07'), false);
  assert.equal(hasSnapshotMonthConflict(snapshots, 1, '2026-08'), false);
});

test('snapshot tabs expose visible edit controls and one-per-month guidance', () => {
  const markup = renderToStaticMarkup(React.createElement(SnapshotTabs, {
    snapshots,
    currentIndex: 1,
    onSelect: () => {},
    onAdd: () => {},
    onChangeDate: () => {},
    onDelete: () => {},
  }));
  assert.match(markup, /Edit selected check-in/);
  assert.match(markup, /One check-in is allowed per calendar month/);
  assert.match(markup, /Latest check-in · editable/);
});
