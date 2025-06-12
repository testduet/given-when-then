import { scenario } from './givenWhenThen';

const setup = jest.fn(() => Promise.resolve(1));
const teardown = jest.fn((_, outcome) => {
  expect(outcome).toBe(1);

  return Promise.resolve();
});

scenario('async teardown', bdd => {
  bdd
    .given('nothing', () => {})
    .when('a setup function is passed', setup, teardown)
    .then('setup should be called but not teardown yet', () => {
      expect(setup).toHaveBeenCalledTimes(1);
      expect(teardown).not.toHaveBeenCalled();
    })
    .and('teardown should have been called', () => expect(teardown).toHaveBeenCalledTimes(1));
});

// With 2 x bdd.then(), setup() and teardown() should have been called twice
test('setup and teardown should have been called twice', () => {
  expect(setup).toHaveBeenCalledTimes(2);
  expect(teardown).toHaveBeenCalledTimes(2);
});
