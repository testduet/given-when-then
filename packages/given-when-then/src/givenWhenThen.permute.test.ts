import { scenario } from './givenWhenThen';
import mergeInto from './mergeInto';

scenario('testing permutation', bdd => {
  bdd.given
    .oneOf([
      ['operator = "+"', mergeInto({ operator: '+', result: 3 })],
      ['operator = "*"', mergeInto({ operator: '*', result: 2 })]
    ])
    .and('a = 1', mergeInto({ a: 1 }))
    .and('b = 2', mergeInto({ b: 2 }))

    .when('calculated', ({ a, b, operator }) => (operator === '*' ? a * b : a + b))

    .then(`result should be correct`, ({ result }, value) => expect(value).toBe(result));
});
