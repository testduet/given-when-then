import { scenario, type TestFacility } from './givenWhenThen';

describe('when() did not throw but then.throw() is expecting an error', () => {
  let facility: TestFacility;
  let thenThrow: jest.Mock<void, []>;

  beforeEach(() => {
    facility = {
      afterEach: jest.fn(),
      beforeEach: jest.fn(),
      describe: jest.fn((_, fn) => fn()),
      it: jest.fn()
    };

    thenThrow = jest.fn();

    scenario(
      'for bdd.then.throw',
      bdd => {
        bdd
          .given('undefined', () => undefined)
          .when('do nothing', () => {})
          .then.throw('should not have been called', () => thenThrow);
      },
      facility
    );
  });

  test('it() should have been called', () => expect(facility.it).toHaveBeenCalledTimes(1));
  test('it() should passed a function that would throw', () =>
    expect(() => (facility.it as jest.Mock<void, [string, () => void]>).mock.calls[0]?.[1]()).toThrow(
      'Scenario should throw but did not'
    ));
  test('thenThrow() should not have been called', () => expect(thenThrow).not.toHaveBeenCalled());
});
