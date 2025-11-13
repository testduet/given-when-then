import { scenario } from './givenWhenThen';

scenario('for bdd.then.throw', bdd => {
  bdd
    .given('value of 1', () => 1)
    .when('throw', () => {
      throw new Error('Artificial error');
    })
    .then.throw('with message "Artificial error"', (_, reason) =>
      expect(reason).toHaveProperty('message', 'Artificial error')
    )
    .when('value + 1', value => value + 1)
    .then('should return 2', (_, returnValue) => expect(returnValue).toBe(2));
});
