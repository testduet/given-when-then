import { scenario } from './givenWhenThen';
import mergeInto from './mergeInto';

scenario('testing "given.oneOf"', bdd => {
  bdd.given
    .oneOf([
      ['operator = "+"', mergeInto({ operator: '+', result: 3 })],
      ['operator = "*"', mergeInto({ operator: '*', result: 2 })]
    ])
    .and('a = 1', mergeInto({ a: 1 }))
    .and('b = 2', mergeInto({ b: 2 }))

    .when('calculated', ({ a, b, operator }) => (operator === '*' ? a * b : a + b))

    .then(`result should be correct`, ({ result }, value) => expect(value).toBe(result));

  bdd
    .given('a = 1', mergeInto({ a: 1 }))
    .and('b = 2', mergeInto({ b: 2 }))
    .and.oneOf([
      ['operator = "+"', mergeInto({ operator: '+', result: 3 })],
      ['operator = "*"', mergeInto({ operator: '*', result: 2 })]
    ])

    .when('calculated', ({ a, b, operator }) => (operator === '*' ? a * b : a + b))

    .then(`result should be correct`, ({ result }, value) => expect(value).toBe(result));
});

const given1 = jest.fn(() => ({ a: 1 }));
const given2 = jest.fn(() => ({ a: 2 }));

scenario('for "given.oneOf"', bdd => {
  bdd.given
    .oneOf([
      ['a = 1', given1],
      ['a = 2', given2]
    ])
    .when('return as-is', state => state)
    .then('should return as-is', (_, outcome) => expect(outcome).toEqual({ a: expect.any(Number) }));
});

test('given1() should have been called once', () => expect(given1).toHaveBeenCalledTimes(1));
test('given2() should have been called once', () => expect(given2).toHaveBeenCalledTimes(1));
