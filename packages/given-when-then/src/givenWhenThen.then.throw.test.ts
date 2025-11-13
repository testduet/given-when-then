import { scenario } from './givenWhenThen';

const thenThrow = jest.fn<void, [number, unknown]>();
const error = new Error('Artificial error');

scenario('for bdd.then.throw', bdd => {
  bdd
    .given('a number 123', () => 123)
    .when('throw', () => {
      throw error;
    })
    .then.throw('with message "Artificial error"', thenThrow);
});

test('then should be called once', () => expect(thenThrow).toHaveBeenCalledTimes(1));
test('then should be called with the error', () => expect(thenThrow).toHaveBeenNthCalledWith(1, 123, error));
