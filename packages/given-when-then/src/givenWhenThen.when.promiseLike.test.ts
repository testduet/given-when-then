import { scenario } from './givenWhenThen';
import mergeInto from './mergeInto';

scenario('when with a Promise function', bdd => {
  bdd
    .given('a = 1', mergeInto({ a: 1 }))
    .and('b = 2', mergeInto({ b: 2 }))

    .when('added', ({ a, b }) => {
      const promise = Promise.resolve(a + b);
      const then = promise.then.bind(promise);

      return { then } satisfies PromiseLike<number>;
    })

    .then('should be 3', (_, actual) => expect(actual).toBe(3));
});
