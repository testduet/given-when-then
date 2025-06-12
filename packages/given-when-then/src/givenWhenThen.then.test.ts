import { scenario } from './givenWhenThen';

const then = jest.fn((_, outcome) => expect(outcome).toEqual({ a: 1 }));

scenario('for bdd.when', bdd => {
  bdd
    .given('a = 1', () => ({ a: 1 }))
    .when('return as-is', state => state)
    .then('should return a = 1', then);
});

test('then should be called once', () => expect(then).toHaveBeenCalledTimes(1));
