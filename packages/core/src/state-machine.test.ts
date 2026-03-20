import { describe, expect, it } from 'vitest';
import { canTransition, isTerminal } from './state-machine.js';
import { STATE_TRANSITIONS, TERMINAL_STATES } from './constants.js';
import type { RunState } from './types.js';

describe('isTerminal', () => {
  it('returns true for completed', () => {
    expect(isTerminal('completed')).toBe(true);
  });

  it('returns true for failed', () => {
    expect(isTerminal('failed')).toBe(true);
  });

  it('returns true for canceled', () => {
    expect(isTerminal('canceled')).toBe(true);
  });

  it('returns false for submitted', () => {
    expect(isTerminal('submitted')).toBe(false);
  });

  it('returns false for working', () => {
    expect(isTerminal('working')).toBe(false);
  });

  it('returns false for input_required', () => {
    expect(isTerminal('input_required')).toBe(false);
  });
});

describe('canTransition', () => {
  it('submitted → working', () => {
    expect(canTransition('submitted', 'working')).toBe(true);
  });

  it('submitted → canceled', () => {
    expect(canTransition('submitted', 'canceled')).toBe(true);
  });

  it('submitted → completed is invalid', () => {
    expect(canTransition('submitted', 'completed')).toBe(false);
  });

  it('working → completed', () => {
    expect(canTransition('working', 'completed')).toBe(true);
  });

  it('working → failed', () => {
    expect(canTransition('working', 'failed')).toBe(true);
  });

  it('working → canceled', () => {
    expect(canTransition('working', 'canceled')).toBe(true);
  });

  it('working → input_required', () => {
    expect(canTransition('working', 'input_required')).toBe(true);
  });

  it('input_required → working', () => {
    expect(canTransition('input_required', 'working')).toBe(true);
  });

  it('input_required → canceled', () => {
    expect(canTransition('input_required', 'canceled')).toBe(true);
  });

  it('completed → working is invalid', () => {
    expect(canTransition('completed', 'working')).toBe(false);
  });

  it('failed → working is invalid', () => {
    expect(canTransition('failed', 'working')).toBe(false);
  });

  it('canceled → working is invalid', () => {
    expect(canTransition('canceled', 'working')).toBe(false);
  });

  it('all terminal states have empty transition arrays', () => {
    for (const state of TERMINAL_STATES) {
      expect(STATE_TRANSITIONS[state]).toEqual([]);
    }
  });
});

describe('STATE_TRANSITIONS', () => {
  it('has entries for all 6 states', () => {
    const allStates: RunState[] = [
      'submitted',
      'working',
      'input_required',
      'completed',
      'failed',
      'canceled',
    ];
    for (const state of allStates) {
      expect(STATE_TRANSITIONS).toHaveProperty(state);
    }
  });
});
