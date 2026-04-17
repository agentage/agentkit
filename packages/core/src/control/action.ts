import type { ActionDefinition } from './types.js';

/** Define a control-plane action. Identity fn — returns config as-is for type inference. */
export const action = <I = unknown, O = unknown, P = unknown>(
  def: ActionDefinition<I, O, P>
): ActionDefinition<I, O, P> => def;
