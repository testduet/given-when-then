import { scenario } from './givenWhenThen';

scenario('testing Promise', bdd => {
  bdd
    .given('a = 1', () => Promise.resolve({ a: 1 }))
    .and('b = 2', state => Promise.resolve({ ...state, b: 2 }))

    .when('added', ({ a, b }) => a + b)

    .then('should be 3', (_, actual) => expect(actual).toBe(3));
});
