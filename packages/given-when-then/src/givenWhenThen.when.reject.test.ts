import { scenario, type TestFacility } from './givenWhenThen';

const error = new Error('Artificial error');

describe('when() reject should skip then()', () => {
  let facility: TestFacility;
  let then: jest.Mock<void, []>;

  beforeEach(() => {
    facility = {
      afterEach: jest.fn(fn => fn()),
      beforeEach: jest.fn(fn => fn()),
      describe: jest.fn((_, fn) => fn()),
      it: jest.fn()
    };

    then = jest.fn();

    scenario(
      'for bdd.when',
      bdd => {
        bdd
          .given('undefined', () => undefined)
          .when('reject', () => Promise.reject(error))
          .then('should not have been called', () => then);
      },
      facility
    );
  });

  test('it() should have been called', () => expect(facility.it).toHaveBeenCalledTimes(1));
  test('it() should passed a function that would throw', () => {
    try {
      (facility.it as jest.Mock<void, [string, () => void]>).mock.calls[0]?.[1]();
    } catch (reason) {
      expect(reason).toBe(error);
    }
  });
  test('then() should not have been called', () => expect(then).not.toHaveBeenCalled());
});
