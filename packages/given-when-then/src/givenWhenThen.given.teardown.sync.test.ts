import { scenario } from './givenWhenThen';

const setup = jest.fn(() => 1);
const teardown = jest.fn(state => expect(state).toBe(1));

scenario('teardown', bdd => {
  bdd
    .given('a setup function', setup, teardown)
    .when('setup', () => {})
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
