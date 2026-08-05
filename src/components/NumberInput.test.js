import test from 'node:test';
import assert from 'node:assert/strict';
import { formatNumericValue, numericDraftResult, parseNumericInput, validateNumericValue } from './NumberInput.jsx';

test('numeric input parses common decimal and grouped formats', () => {
  assert.equal(parseNumericInput('1 234,56'), 1234.56);
  assert.equal(parseNumericInput('1,234.56'), 1234.56);
  assert.equal(parseNumericInput('12.5'), 12.5);
  assert.equal(parseNumericInput('not a number'), null);
});

test('numeric drafts preserve empty values and reject invalid ranges', () => {
  assert.deepEqual(numericDraftResult('', { required: false, label: 'Value' }), { value: '', error: '' });
  assert.match(numericDraftResult('-1', { min: 0, label: 'Value' }).error, /at least 0/);
  assert.deepEqual(numericDraftResult('12.3456', { precision: 2, label: 'Value' }), { value: 12.35, error: '' });
  assert.equal(validateNumericValue(101, { max: 100, label: 'Percentage' }), 'Percentage must be no more than 100.');
});

test('numeric values format for money, percentages, quantities, and FX', () => {
  assert.equal(formatNumericValue('', { kind: 'money', currency: 'EUR' }), '');
  assert.match(formatNumericValue(1234.5, { kind: 'money', currency: 'EUR', locale: 'en-US' }), /€1,234.5/);
  assert.equal(formatNumericValue(25, { kind: 'percent', locale: 'en-US' }), '25%');
  assert.equal(formatNumericValue(1.2345678, { kind: 'fx', locale: 'en-US' }), '1.234568');
});
