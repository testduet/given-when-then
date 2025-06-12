import { scenario } from './givenWhenThen';

const given = jest.fn(() => ({ a: 1 }));

scenario('for bdd.given', bdd => {
  bdd
    .given('a = 1', given)
    .when('return as-is', state => state)
    .then('should return a = 1', (_, outcome) => expect(outcome).toEqual({ a: 1 }));
});

test('given should be called once', () => expect(given).toHaveBeenCalledTimes(1));
