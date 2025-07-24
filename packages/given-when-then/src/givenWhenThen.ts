import isPromiseLike from './private/isPromiseLike.ts';

interface BehaviorDrivenDevelopment {
  given: Given<void>;
}

type GivenPermutation<TPrecondition, TNextPrecondition> =
  | readonly [
      string,
      (precondition: TPrecondition) => PromiseLike<TNextPrecondition> | TNextPrecondition,
      ((precondition: TNextPrecondition) => PromiseLike<void> | void) | undefined
    ]
  | readonly [string, (precondition: TPrecondition) => PromiseLike<TNextPrecondition> | TNextPrecondition];

interface Given<TPrecondition> {
  <TNextPrecondition>(
    message: string,
    setup: (precondition: TPrecondition) => PromiseLike<TNextPrecondition> | TNextPrecondition,
    teardown?: ((precondition: TNextPrecondition) => PromiseLike<void> | void) | undefined
  ): {
    and: Given<TNextPrecondition>;
    when: When<TNextPrecondition, void>;
  };

  oneOf<TNextPrecondition>(permutations: readonly GivenPermutation<TPrecondition, TNextPrecondition>[]): {
    and: Given<TNextPrecondition>;
    when: When<TNextPrecondition, void>;
  };
}

type WhenPermutation<TPrecondition, TOutcome, TNextOutcome> =
  | readonly [
      string,
      (precondition: TPrecondition, outcome: TOutcome) => PromiseLike<TNextOutcome> | TNextOutcome,
      ((precondition: TPrecondition, outcome: TNextOutcome) => PromiseLike<void> | void) | undefined
    ]
  | readonly [string, (precondition: TPrecondition, outcome: TOutcome) => PromiseLike<TNextOutcome> | TNextOutcome];

interface When<TPrecondition, TOutcome> {
  <TNextOutcome>(
    message: string,
    setup: (precondition: TPrecondition, outcome: TOutcome) => PromiseLike<TNextOutcome> | TNextOutcome,
    teardown?: ((precondition: TPrecondition, outcome: TNextOutcome) => PromiseLike<void> | void) | undefined
  ): {
    then: Then<TPrecondition, TNextOutcome>;
  };

  oneOf<TNextOutcome>(permutations: readonly WhenPermutation<TPrecondition, TOutcome, TNextOutcome>[]): {
    then: Then<TPrecondition, TNextOutcome>;
  };
}

interface Then<TPrecondition, TOutcome> {
  (
    message: string,
    fn: (precondition: TPrecondition, outcome: TOutcome) => void
  ): {
    and: Then<TPrecondition, TOutcome>;
    when: When<TPrecondition, TOutcome>;
  };
}

interface TestFacility {
  afterEach: (fn: () => Promise<void> | void) => void;
  beforeEach: (fn: () => Promise<void> | void) => void;
  describe: (message: string, fn: () => void) => void;
  it: (message: string, fn: (() => Promise<void>) | (() => void)) => void;
}

type Ref<T> = { value: T };

type GivenFrame<TPrecondition, TNextPrecondition> = {
  isConjunction: boolean;
  operation: 'given';
  permutations: readonly GivenPermutation<TPrecondition, TNextPrecondition>[];
};

type WhenFrame<TPrecondition, TOutcome, TNextOutcome> = {
  permutations: readonly WhenPermutation<TPrecondition, TOutcome, TNextOutcome>[];
  operation: 'when';
};

type ThenFrame<TPrecondition, TOutcome> = {
  isConjunction: boolean;
  message: string;
  operation: 'then';
  fn: (precondition: TPrecondition, outcome: TOutcome) => PromiseLike<void> | void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Frame = GivenFrame<unknown, any> | ThenFrame<unknown, unknown> | WhenFrame<unknown, unknown, any>;

function createChain(mutableStacks: (readonly Frame[])[], stack: readonly Frame[]) {
  const given: (isConjunction: boolean) => Given<unknown> = (isConjunction: boolean) => {
    const given: Given<unknown> = <TNextPrecondition>(
      message: string,
      setup: (value: unknown) => PromiseLike<TNextPrecondition> | TNextPrecondition,
      teardown?: ((value: TNextPrecondition) => PromiseLike<void> | void) | undefined
    ) => {
      const nextChain = createChain(
        mutableStacks,
        Object.freeze([
          ...stack,
          {
            isConjunction,
            operation: 'given',
            permutations: [[message, setup, teardown]]
          } satisfies GivenFrame<unknown, TNextPrecondition>
        ])
      );

      return {
        and: nextChain.given(true) as Given<Awaited<ReturnType<typeof setup>>>,
        when: nextChain.when() as When<Awaited<ReturnType<typeof setup>>, void>
      } satisfies ReturnType<Given<Awaited<ReturnType<typeof setup>>>>;
    };

    given.oneOf = (<TNextPrecondition>(permutations: readonly GivenPermutation<unknown, TNextPrecondition>[]) => {
      const nextChain = createChain(
        mutableStacks,
        Object.freeze([
          ...stack,
          {
            isConjunction,
            operation: 'given',
            permutations
          } satisfies GivenFrame<unknown, TNextPrecondition>
        ])
      );

      return {
        and: nextChain.given(true) as Given<TNextPrecondition>,
        when: nextChain.when() as When<TNextPrecondition, void>
      } satisfies ReturnType<Given<TNextPrecondition>>;
    }) satisfies Given<unknown>['oneOf'];

    return given;
  };

  const when: () => When<unknown, unknown> = () => {
    const when: When<unknown, unknown> = (message, setup, teardown) => {
      const nextChain = createChain(
        mutableStacks,
        Object.freeze([...stack, { operation: 'when', permutations: [[message, setup, teardown]] }])
      );

      return {
        then: nextChain.then(false) as Then<unknown, Awaited<ReturnType<typeof setup>>>
      } satisfies ReturnType<When<unknown, Awaited<ReturnType<typeof setup>>>>;
    };

    when.oneOf = (<TNextOutcome>(permutations: readonly WhenPermutation<unknown, unknown, TNextOutcome>[]) => {
      const nextChain = createChain(
        mutableStacks,
        Object.freeze([
          ...stack,
          {
            operation: 'when',
            permutations
          } satisfies WhenFrame<unknown, unknown, TNextOutcome>
        ])
      );

      return {
        then: nextChain.then(false) as Then<unknown, TNextOutcome>
      } satisfies ReturnType<When<unknown, TNextOutcome>>;
    }) satisfies When<unknown, unknown>['oneOf'];

    return when;
  };

  const then: (isConjunction: boolean) => Then<unknown, unknown> = isConjunction => {
    return ((message, fn) => {
      mutableStacks.push(
        Object.freeze([
          ...stack,
          {
            isConjunction,
            fn,
            message,
            operation: 'then'
          } satisfies ThenFrame<unknown, unknown>
        ])
      );

      const currentChain = createChain(mutableStacks, stack);

      return {
        and: currentChain.then(true),
        when: currentChain.when()
      } satisfies ReturnType<Then<unknown, unknown>>;
    }) satisfies Then<unknown, unknown>;
  };

  return { given, then, when };
}

function scenario(
  message: string,
  fn: (bdd: BehaviorDrivenDevelopment) => void,
  options?: Partial<TestFacility>
): void {
  const stacks: (readonly Frame[])[] = [];

  const fnResult = fn({
    given: createChain(stacks, Object.freeze([])).given(false) as Given<void>
  });

  if (isPromiseLike(fnResult)) {
    // This is a soft block.
    // While we can technically allow fn() to be asynchronous, we are blocking it
    // to prevent potentially bad code patterns
    throw new Error('The function passed to scenario() cannot asynchronous');
  } else if (!stacks.some(frames => frames.some(frame => frame.operation === 'then'))) {
    throw new Error('Scenario should contains at least one then clause');
  }

  const facility = {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    afterEach: options?.afterEach || (globalThis.afterEach as TestFacility['afterEach']),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    beforeEach: options?.beforeEach || (globalThis.beforeEach as TestFacility['beforeEach']),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    describe: options?.describe || (globalThis.describe as TestFacility['describe']),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    it: options?.it || (globalThis.it as TestFacility['it'])
  };

  facility.describe(message, () => {
    for (const stack of stacks) {
      runStack(stack, { value: undefined }, { value: undefined }, facility);
    }
  });
}

function runStack(
  stack: readonly Frame[],
  preconditionRef: Ref<unknown>,
  outcomeRef: Ref<unknown>,
  facility: TestFacility
): void {
  const frame = stack.at(0);

  if (!frame) {
    return;
  }

  if (frame.operation === 'given') {
    for (const [message, setup, teardown] of frame.permutations) {
      facility.describe(`${frame.isConjunction ? 'and' : 'given'} ${message}`, () => {
        let currentPreconditionRef: Ref<unknown>;

        facility.beforeEach(() => {
          const save = (value: unknown): void => {
            currentPreconditionRef = { value };
            preconditionRef.value = value;
          };

          const value = setup(preconditionRef.value);

          return isPromiseLike(value) ? Promise.resolve(value.then(save)) : save(value);
        });

        facility.afterEach(() => {
          const value = teardown?.(currentPreconditionRef.value);

          return isPromiseLike(value) ? Promise.resolve(value) : value;
        });

        return runStack(stack.slice(1), preconditionRef, outcomeRef, facility);
      });
    }
  } else if (frame.operation === 'when') {
    for (const [message, setup, teardown] of frame.permutations) {
      facility.describe(`when ${message}`, () => {
        let currentOutcomeRef: { value: unknown };

        facility.beforeEach(() => {
          const save = (value: unknown): void => {
            currentOutcomeRef = { value };
            outcomeRef.value = value;
          };

          const value = setup(preconditionRef.value, outcomeRef.value);

          return isPromiseLike(value) ? Promise.resolve(value.then(save)) : save(value);
        });

        facility.afterEach(() => {
          const value = teardown?.(preconditionRef.value, currentOutcomeRef.value);

          return isPromiseLike(value) ? Promise.resolve(value) : value;
        });

        return runStack(stack.slice(1), preconditionRef, outcomeRef, facility);
      });
    }
  } else if (frame.operation === 'then') {
    facility.it(`${frame.isConjunction ? 'and' : 'then'} ${frame.message}`, () =>
      frame.fn(preconditionRef.value, outcomeRef.value)
    );

    return runStack(stack.slice(1), preconditionRef, outcomeRef, facility);
  }
}

export { scenario, type TestFacility };
