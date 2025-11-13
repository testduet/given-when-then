import { scenario } from './givenWhenThen';

const setup = jest.fn(() => {
  throw new Error('Artificial error');
});

const teardown = jest.fn((_, outcome) => expect(outcome).toBeUndefined());

scenario('teardown', bdd => {
  bdd
    .given('a number 123', () => 123)
    .when('a setup function is passed', setup, teardown)
    .then.throw('setup should throw', (value, error) => {
      expect(value).toBe(123);
      expect(error).toHaveProperty('message', 'Artificial error');
    });
});

test('setup should have been called once', () => expect(setup).toHaveBeenCalledTimes(1));
test('teardown should have been called once', () => expect(teardown).toHaveBeenCalledTimes(1));
