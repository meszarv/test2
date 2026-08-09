import test from 'node:test';
import assert from 'node:assert/strict';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';
import TargetAllocationBar, {
  addTargetAllocation,
  adjustAdjacentTargets,
  normalizeTargetAllocations,
  removeTargetAllocation,
  setTargetAllocation,
} from './TargetAllocationBar.jsx';

function total(allocation) {
  return Object.values(allocation).reduce((sum, value) => sum + value, 0);
}

test('target allocation helpers preserve a precise 100% total', () => {
  assert.deepEqual(normalizeTargetAllocations({ stock: 80, bond: 40 }), { stock: 67, bond: 33 });

  const added = addTargetAllocation({ stock: 65, bond: 25, commodity: 10 }, 'cash');
  assert.deepEqual(added, { stock: 60, bond: 25, commodity: 10, cash: 5 });
  assert.equal(total(added), 100);

  const removed = removeTargetAllocation({ stock: 65, bond: 25, commodity: 10 }, 'bond');
  assert.deepEqual(removed, { stock: 90, commodity: 10 });
  assert.equal(total(removed), 100);

  const decreased = setTargetAllocation({ stock: 65, bond: 25, commodity: 10 }, 'stock', 50.4);
  assert.deepEqual(decreased, { stock: 50, bond: 40, commodity: 10 });
  assert.equal(total(decreased), 100);

  const increased = setTargetAllocation({ stock: 65, bond: 25, commodity: 10 }, 'stock', 80.4);
  assert.deepEqual(increased, { stock: 80, bond: 10, commodity: 10 });
  assert.equal(total(increased), 100);

  const adjacent = adjustAdjacentTargets({ stock: 65, bond: 25, commodity: 10 }, 'stock', 'bond', 70);
  assert.deepEqual(adjacent, { stock: 70, bond: 20, commodity: 10 });
  assert.equal(total(adjacent), 100);
});

test('allocation dividers expose accessible values and support keyboard adjustment', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.HTMLElement = dom.window.HTMLElement;
  global.Event = dom.window.Event;
  global.KeyboardEvent = dom.window.KeyboardEvent;
  global.IS_REACT_ACT_ENVIRONMENT = true;
  const { createRoot } = await import('react-dom/client');

  function Harness() {
    const [allocation, setAllocation] = useState({ stock: 65, bond: 25, commodity: 10 });
    return React.createElement(React.Fragment, null,
      React.createElement(TargetAllocationBar, {
        allocations: allocation,
        labels: { stock: { name: 'Stock' }, bond: { name: 'Bond' }, commodity: { name: 'Commodity' } },
        onChange: setAllocation,
      }),
      React.createElement('output', null, JSON.stringify(allocation)),
    );
  }

  const root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(Harness)));
  const sliders = document.querySelectorAll('[role="slider"]');
  assert.equal(sliders.length, 2);
  assert.equal(sliders[0].getAttribute('aria-valuenow'), '65');
  assert.match(sliders[0].getAttribute('aria-valuetext'), /Stock 65%, Bond 25%/);

  await act(async () => sliders[0].dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })));
  assert.deepEqual(JSON.parse(document.querySelector('output').textContent), { stock: 66, bond: 24, commodity: 10 });

  const updatedSlider = document.querySelector('[role="slider"]');
  await act(async () => updatedSlider.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true, bubbles: true })));
  assert.deepEqual(JSON.parse(document.querySelector('output').textContent), { stock: 65, bond: 25, commodity: 10 });

  await act(async () => root.unmount());
  dom.window.close();
});
