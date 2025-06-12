import { expect } from 'expect';
import { mergeInto } from '@testduet/given-when-then';

it('should merge two objects', () => {
  expect(mergeInto({ b: 2 })({ a: 1 })).toEqual({ a: 1, b: 2 });
});

it('should overwrite', () => {
  expect(mergeInto({ a: 2 })({ a: 1 })).toEqual({ a: 2 });
});

it('should merge into undefined', () => {
  expect(mergeInto({ a: 1 })(undefined)).toEqual({ a: 1 });
});

it('should merge undefined', () => {
  expect(mergeInto(undefined)({ a: 1 })).toEqual({ a: 1 });
});
