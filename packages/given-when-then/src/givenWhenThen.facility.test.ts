import { scenario, type TestFacility } from './givenWhenThen';
import mergeInto from './mergeInto';

type Stack = {
  describes: Stack[];
  message: string;
  numAfterEach: number;
  numBeforeEach: number;
  numTest: number;
};

function createStack(message: string): Stack {
  return {
    describes: [],
    message,
    numAfterEach: 0,
    numBeforeEach: 0,
    numTest: 0
  };
}

describe('run scenario()', () => {
  const rootStack = createStack('root');
  let currentStack = rootStack;

  const facility: TestFacility = {
    afterEach: jest.fn(() => {
      currentStack.numAfterEach++;
    }),
    beforeEach: jest.fn(() => {
      currentStack.numBeforeEach++;
    }),
    describe: jest.fn((message, fn) => {
      const thisStack = currentStack;

      currentStack = createStack(message);
      thisStack.describes.push(currentStack);

      fn();

      currentStack = thisStack;
    }),
    it: jest.fn(() => {
      currentStack.numTest++;
    })
  };

  scenario(
    'for this scenario',
    bdd => {
      bdd
        .given('a = 1', mergeInto({ a: 1 }))
        .and('b = 2', mergeInto({ b: 2 }))

        .when('a + b', ({ a, b }) => a + b)

        .then('should return 3', (_, value) => expect(value).toBe(3));
    },
    facility
  );

  test('should work', () =>
    expect(rootStack).toEqual({
      describes: [
        {
          describes: [
            {
              describes: [
                {
                  describes: [
                    {
                      describes: [],
                      message: 'when a + b',
                      numAfterEach: 1,
                      numBeforeEach: 1,
                      numTest: 1
                    }
                  ],
                  message: 'and b = 2',
                  numAfterEach: 1,
                  numBeforeEach: 1,
                  numTest: 0
                }
              ],
              message: 'given a = 1',
              numAfterEach: 1,
              numBeforeEach: 1,
              numTest: 0
            }
          ],
          message: 'for this scenario',
          numAfterEach: 0,
          numBeforeEach: 0,
          numTest: 0
        }
      ],
      message: 'root',
      numAfterEach: 0,
      numBeforeEach: 0,
      numTest: 0
    }));
});
