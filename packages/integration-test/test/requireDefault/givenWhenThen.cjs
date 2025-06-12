const { mergeInto, scenario } = require('@testduet/given-when-then');
const assert = require('node:assert');

module.exports = function (facility) {
  scenario(
    'comprehensive',
    bdd => {
      bdd
        .given('a = 1', mergeInto({ a: 1 }))
        .and.oneOf([
          ['b = 2', mergeInto({ b: 2, result: [3, 2] })],
          ['b = 3', mergeInto({ b: 3, result: [4, 3] })]
        ])

        .when.oneOf([
          ['added', ({ a, b, result }) => ({ actual: a + b, expected: result[0] })],
          ['multiplied', ({ a, b, result }) => ({ actual: a * b, expected: result[1] })]
        ])

        .then('should be correct', (_, { actual, expected }) => assert.strictEqual(actual, expected));
    },
    facility
  );
};
