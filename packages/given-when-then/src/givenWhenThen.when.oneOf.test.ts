import { scenario } from './givenWhenThen';
import mergeInto from './mergeInto';

scenario('when.oneOf', bdd => {
  bdd
    .given('a = 1', mergeInto({ a: 1 }))
    .and('b = 2', mergeInto({ b: 2 }))

    .when.oneOf([
      ['added', ({ a, b }) => ({ actual: a + b, expected: 3 })],
      ['multiplied', ({ a, b }) => ({ actual: a * b, expected: 2 })]
    ])

    .then(`result should be correct`, (_, { actual, expected }) => expect(actual).toBe(expected));
});

const when1 = jest.fn(({ a }) => ({ b: a + 1 }));
const when2 = jest.fn(({ a }) => ({ b: a + 2 }));

scenario('for "given.oneOf"', bdd => {
  bdd
    .given('a = 1', mergeInto({ a: 1 }))
    .when.oneOf([
      ['return with b = a + 1', when1],
      ['return with b = a + 2', when2]
    ])
    .then('should return b as a number', (_, outcome) => expect(outcome).toEqual({ b: expect.any(Number) }));
});

test('when1() should have been called once', () => expect(when1).toHaveBeenCalledTimes(1));
test('when2() should have been called once', () => expect(when2).toHaveBeenCalledTimes(1));
