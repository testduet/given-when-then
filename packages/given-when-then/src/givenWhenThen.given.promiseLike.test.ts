import { scenario } from './givenWhenThen';

scenario('testing Promise', bdd => {
  bdd
    .given('a = 1', () => {
      const promise = Promise.resolve({ a: 1 });
      const then = promise.then.bind(promise);

      return { then } satisfies PromiseLike<{ a: number }>;
    })
    .and('b = 2', state => {
      const promise = Promise.resolve({ ...state, b: 2 });
      const then = promise.then.bind(promise);

      return { then } satisfies PromiseLike<{ a: number; b: number }>;
    })

    .when('added', ({ a, b }) => a + b)

    .then('should be 3', (_, actual) => expect(actual).toBe(3));
});
