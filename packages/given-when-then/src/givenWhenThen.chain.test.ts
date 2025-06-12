import { scenario } from './givenWhenThen';
import mergeInto from './mergeInto';

scenario('chain', bdd => {
  const branch = bdd.given('a = 1', mergeInto({ a: 1 })).and('b = 2', mergeInto({ b: 2 }));

  branch
    .when('value = a + b', ({ a, b }) => a + b)

    .then('value should be 3', (_, value) => expect(value).toBe(3))
    .and('value should be odd number', (_, value) => expect(value % 2).toBe(1));

  branch
    .and('a = 3', mergeInto({ a: 3 }))

    .when('value = a * b', ({ a, b }) => a * b)

    .then('value should be 6', (_, value) => expect(value).toBe(6))
    .and('value should be divisible by 3', (_, value) => expect(value % 3).toBe(0))

    .when('value /= 4', (_, value) => value / 4)

    .then('value should be 1.5', (_, value) => expect(value).toBe(1.5));

  branch
    .and('b = 4', mergeInto({ b: 4 }))

    .when('value = a * b', ({ a, b }) => a * b)

    .then('value should be 4', (_, value) => expect(value).toBe(4));
});
