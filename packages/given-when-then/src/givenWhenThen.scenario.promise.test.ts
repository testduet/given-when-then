import { scenario } from './givenWhenThen';

test('should throw', () =>
  expect(() =>
    scenario('sample', bdd => {
      bdd
        .given('nothing', () => {})
        .when('do nothing', () => {})
        .then('should be nothing', () => {});

      return Promise.resolve();
    })
  ).toThrow());
