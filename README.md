# `@testduet/given-when-then`

Write behavior-driven development (BDD) tests using "given-when-then" pattern and execute them in any traditional "describe-before-it-after" test framework.

## Background

([Try our demo](https://testduet.github.io/given-when-then/))

[Behavior-driven development](https://en.wikipedia.org/wiki/Behavior-driven_development) aims to bridge the communication gap between engineering teams and business stakeholders. It uses a standardized test scenario format:

- Given: the starting preconditions for the scenario
- When: the specific trigger that initiates the scenario
- Then: the expected outcome

Today, a lot of test framework adopted the "describe-before-it-after" pattern. However, despite its wide adoption, it is not efficient for BDD tests.

This package offers syntactic sugar of "given-when-then" pattern for test framework which naturally support the "describe-before-it-after" pattern. Currently, it is tested to work with the following JavaScript test frameworks.

- [Jasmine](https://jasmine.github.io/)
- [Jest](https://jestjs.io/)
- [Mocha](https://mochajs.org/)
- [Node.js test runner](https://nodejs.org/api/test.html)
- [Vitest](https://vitest.dev/)

## How to use

Assume a supported test framework is installed.

```sh
npm install --save-dev @testduet/given-when-then
```

Then, put the following code in your test.

```ts
import { scenario } from '@testduet/given-when-then';

// System under test
function sum(x, y) {
  return x + y;
}

// Test scenario
scenario('calling sum() with two values', bdd => {
  bdd
    .given('a = 1 and b = 2', () => ({ a: 1, b: 2 }))

    .when('sum(a, b) is called', ({ a, b }) => sum(a + b))

    .then('should return 3', ({ a, b }, outcome) => expect(outcome).toBe(a + b));
});
```

Lastly, run the test.

When the `scenario()` function ended, it will execute all "given-when-then" clauses by converting them into "describe-before-it-after".

## Design

Given the following test scenario:

- Given: `a = 1` and `b = 2`
- When: `a + b`
- Then: should return `3`

When writing in traditional pattern, minimalistically, it would look like:

```ts
test('a = 1, b = 2, a + b should return 3', () => {
  // GIVEN: a = 1 and b = 2
  const a = 1;
  const b = 2;

  // WHEN: a + b
  const outcome = a + b;

  // THEN: it should return 3
  expect(outcome).toBe(3);
});
```

This test code presents a few challenges:

- As the number of assertions grow, it is not trivial to know which one failed
  - Assertion should be refactored into their own `it()` blocks with a good name
- As preconditions grow in complexity, identifying which specific precondition failed becomes increasingly difficult
  - Precondition should be refactored in their own `before*()` blocks, optionally in a layer of `describe()`
- Adding more triggers increases test execution time and makes debugging more challenging when failures occur later in the scenario
  - New triggers and validations should be added using another layer of `describe()` and `before*()` blocks
- Mock and state is mutable in the scenario and they could affect latter validations
  - Use `beforeEach()`/`afterEach()` to reset mock and state

Ultimately, as test complexity increases, debuggability diminishes.

The code above can be refactored for better debuggability.

```ts
describe('given a = 1 and b = 2', () => {
  let a: number;
  let b: number;

  beforeEach(() => {
    a = 1;
    b = 2;
  });

  describe('when a + b', () => {
    let outcome: number;

    beforeEach(() => {
      outcome = a + b;
    });

    it('then should return 3', (_, outcome) => expect(outcome).toBe(3));
  });
});
```

However, this pattern is not very efficient at readability and writability. As the number of preconditions and triggers increase, this pattern would quickly become an "arrow" anti-pattern.

With our package, we are introducing an unique pattern based on BDD "given-when-then" clauses.

```ts
scenario('simple', bdd => {
  bdd
    .given('a = 1 and b = 2', () => ({ a: 1, b: 2 }))

    .when('a + b', ({ a, b }) => a + b)

    .then('should return 3', (_, outcome) => expect(outcome).toBe(3));
});
```

When the `scenario()` call ended, the "given-when-then" clauses are converted to the second code snippet "describe-before-it-after" in runtime.

### Parameterized testing

Parameterized testing is a feature to increase test coverage without bloating up the test code. In our package, it is represented by `given.oneOf()` and `when.oneOf()` function.

```ts
scenario('simple', bdd => {
  bdd
    .given('a = 1 and b = 2', () => ({ a: 1, b: 2 }))

    .when.oneOf([
      ['a + b', ({ a, b }) => ({ actual: a + b, expected: 3 })],
      ['a * b', ({ a, b }) => ({ actual: a * b, expected: 2 })]
    ])

    .then('should return correct result', (_, { actual, expected }) => {
      expect(actual).toBe(expected);
    });
});
```

The `oneOf()` function is available on both `given` and `when` clauses. It branches out the test with copies of sub-branch. The code above essentially runs the same as follows, minus duplication.

```ts
scenario('simple', bdd => {
  const branch = bdd.given('a = 1 and b = 2', () => ({ a: 1, b: 2 }));

  branch
    .when('a + b', ({ a, b }) => ({ actual: a + b, expected: 3 }))
    .then('should return correct result', (_, { actual, expected }) => {
      expect(actual).toBe(expected);
    });

  branch
    .when('a * b', ({ a, b }) => ({ actual: a * b, expected: 2 }))
    .then('should return correct result', (_, { actual, expected }) => {
      expect(actual).toBe(expected);
    });
});
```

## Behaviors

### Is it another test framework?

No, this is not another test framework but opt-in syntactic sugar.

Unlike production code which may change from time to time, test code are less likely to change (thanks to red-green-refactor philosophy) and bigger in size (3-5 times the size of production code.)

Test code is often considered cornerstone of the system.

Given the proven stability and extensive size of test code, migration to a new test framework typically involves keeping existing tests in the original framework. Validation processes commonly run both test frameworks in parallel.

We want to avoid fragmentation. Instead of building a new test framework, we opt for building syntactic sugar on top of existing test framework.

### How is given-when-then converted to describe-before-it-after?

- `given(message, setup, teardown)` will be converted to `describe(message)`, `beforeEach(setup)`, and `afterEach(teardown)`
- `when(message, setup, teardown)` will be converted to `describe(message)`, `beforeEach(setup)`, and `afterEach(teardown)`
- `then(message, assertion)` will be converted to `it(message, assertion)`

### When is the conversion happen?

When the `scenario()` call ended synchronously, it will start the conversion and call the corresponding describe-before-it-after functions.

### Can I use `describe.each()`?

`describe.each()` is part of parameterized testing.

Parameterized testing is supported via `oneOf()` function. Please refer to [this section](#parameterized-testing) for details.

### Can I branch out tests?

Yes, branching is supported in function chaining.

```ts
scenario('fetching a resources', bdd => {
  const branch = bdd
    .given('a URL', () => '/api/user')
    .when('fetched', url => fetch(url))
    .then('should return ok', (_, res) => expect(res.ok).toBe(true));

  // Continue the existing function chaining.
  branch
    .when('parsed as JSON', (_, res) => res.json())
    .then('should return { "id": 1 }', (_, body) => expect(body).toEqual({ id: 1 }));

  // Branch out and continue the function chaining at an earlier point.
  branch
    .when('parsed as text', (_, res) => res.text())
    .then('should return JSON text of { "id": 1 }', (_, body) => expect(body).toEqual('{"id":1}'));
});
```

After "fetched" trigger has been validated, both "parsed as JSON" and "parsed as text" trigger will be validated separately.

### How branching works?

> This is a logical representation and not an exact implementation.

On `scenario()` call started, it will create a tree structure. Every `given`, `when`, `then` clause will be saved to the tree structure.

Normally, without branching, the tree structure is linear. When branching occurs, it will start creating branches.

Once the `scenario()` call has finished, the tree will be converted to "describe-before-it-after" and test case will be validated immediately.

### Can I run multiple assertions inside the `then` clause?

Yes, but this approach is not recommended as it reduces debuggability. For better test clarity and easier debugging, use the `and` clause to separate multiple assertions.

### Why `given` and `when` clause looks very similar?

Both clauses serve as pre-validation setup steps, making them functionally similar. The key distinction is that `given` clauses should remain pure without side effects, while `when` clauses may produce side effects. Additionally, multi-step scenarios must have exactly one set of `given` clauses but can contain multiple `when`-`then` clause pairs.

In the future, we will improve their functionality with "red-to-green" validation. The validation will run the `then` clause twice in 2 different runs:

- Green run: The `when` clause is executed, followed by the `then` clause, with validation expected to pass
- Red run: The `when` clause is skipped while only the `then` clause executes, with validation expected to fail

The "red-to-green" validation ensures that the `when` and `then` clauses are tightly coupled, demonstrating their effectiveness in testing the scenario.

## Contributions

Like us? [Star](https://github.com/testduet/given-when-then/stargazers) us.

Want to make it better? [File](https://github.com/testduet/given-when-then/issues) us an issue.

Don't like something you see? [Submit](https://github.com/testduet/given-when-then/pulls) a pull request.
