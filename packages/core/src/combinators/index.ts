/**
 * Composition combinators — each returns an Agent so they recurse without limit.
 *
 *   sequence(a, b, c)     — run a, b, c in order; thread output.config forward
 *   parallel([a, b, c])   — run concurrently; tuple of results; fail-fast
 *   map(items, factory)   — fan-out; one child per item; array of results
 *
 * All three are pure functions over ctx.run — the combinator IS an Agent
 * whose run() invokes ctx.run for each step. Runs in-process (via default
 * makeCtxRun) or through the daemon (via runtime.dispatch) transparently.
 */
import { agent } from '../agent.js';
import { result as resultEvent } from '../events.js';
import type { Agent, CtxRunResult, RunInput } from '../types.js';
import { mergeGenerators } from './merge.js';

export type StepRef = Agent | string;

/** Input is threaded forward: if a step's output is an object, it replaces `config`. */
const threadInput = (base: RunInput, previousOutput: unknown): RunInput => {
  if (previousOutput === undefined || previousOutput === null) return base;
  if (typeof previousOutput === 'object' && !Array.isArray(previousOutput)) {
    return { ...base, config: previousOutput as Record<string, unknown> };
  }
  return base;
};

/**
 * Run `steps` one after another. Each step's `result.output` (if an object)
 * becomes the next step's `input.config`. Halts on first failure and yields
 * a failing result. The overall `output` is the final step's output.
 */
export const sequence = (...steps: StepRef[]): Agent =>
  agent({
    name: 'sequence',
    description: `sequence(${steps.length} steps)`,
    async *run(input, ctx) {
      if (steps.length === 0) {
        yield resultEvent(true);
        return;
      }
      let carry: unknown;
      let last: CtxRunResult = { success: true };
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepInput = i === 0 ? input : threadInput(input, carry);
        last = yield* ctx.run(step, stepInput);
        if (!last.success) {
          yield resultEvent(false, last.output);
          return;
        }
        carry = last.output;
      }
      yield resultEvent(true, last.output);
    },
  });

/**
 * Run `steps` concurrently with the same input. Events interleave as they
 * arrive (via mergeGenerators). The overall result is an array of child
 * outputs in input order; any child failure flips overall success to false
 * but does NOT cancel the other children — caller decides via the result.
 */
export const parallel = (steps: StepRef[]): Agent =>
  agent({
    name: 'parallel',
    description: `parallel(${steps.length} steps)`,
    async *run(input, ctx) {
      if (steps.length === 0) {
        yield resultEvent(true, []);
        return;
      }
      const gens = steps.map((step) => ctx.run(step, input));
      const childResults = yield* mergeGenerators(gens);
      const outputs = childResults.map((r) => r.output);
      const allSucceeded = childResults.every((r) => r.success);
      yield resultEvent(allSucceeded, outputs);
    },
  });

export type MapFactory<T> = (item: T, index: number) => StepRef;

/**
 * Fan-out: for each item, resolve the step (via factory) and run it
 * concurrently. Each child's input is the parent's `task` with a `config`
 * object of `{ item }` (merged over parent input.config) — the agent reads
 * `input.config.item` to get its slice.
 *
 * Overall output is an array of child outputs in item order.
 */
export const map = <T>(items: T[], factory: MapFactory<T>): Agent =>
  agent({
    name: 'map',
    description: `map(${items.length} items)`,
    async *run(input, ctx) {
      if (items.length === 0) {
        yield resultEvent(true, []);
        return;
      }
      const gens = items.map((item, index) => {
        const childInput: RunInput = {
          ...input,
          config: { ...(input.config ?? {}), item },
        };
        return ctx.run(factory(item, index), childInput);
      });
      const childResults = yield* mergeGenerators(gens);
      const outputs = childResults.map((r) => r.output);
      const allSucceeded = childResults.every((r) => r.success);
      yield resultEvent(allSucceeded, outputs);
    },
  });
