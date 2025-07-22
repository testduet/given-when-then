import { scenario } from './givenWhenThen';

test('should throw', () =>
  expect(() =>
    scenario('sample', bdd => {
      bdd
        .given('nothing', () => {})
        .when('do nothing', () => {})
        .then('should be nothing', () => {});

      const promise = Promise.resolve();
      const then = promise.then.bind(promise);

      return { then } satisfies PromiseLike<void>;
    })
  ).toThrow());
