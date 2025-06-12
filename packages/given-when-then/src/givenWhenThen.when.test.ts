import { scenario } from './givenWhenThen';

const when = jest.fn(({ a }) => ({ b: a + 1 }));

scenario('for bdd.when', bdd => {
  bdd
    .given('a = 1', () => ({ a: 1 }))

    .when('return b = a + 1', when)

    .then('should return b = 2', (_, outcome) => expect(outcome).toEqual({ b: 2 }));
});

test('when should be called once', () => expect(when).toHaveBeenCalledTimes(1));
