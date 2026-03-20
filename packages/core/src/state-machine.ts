import type { RunState } from './types.js';
import { STATE_TRANSITIONS, TERMINAL_STATES } from './constants.js';

/** Check if a run state is terminal */
export const isTerminal = (state: RunState): boolean => TERMINAL_STATES.includes(state);

/** Check if a state transition is valid */
export const canTransition = (from: RunState, to: RunState): boolean =>
  STATE_TRANSITIONS[from].includes(to);
