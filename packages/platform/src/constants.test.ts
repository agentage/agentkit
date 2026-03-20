import { describe, expect, it } from 'vitest';
import {
  HEARTBEAT_INTERVAL,
  OFFLINE_THRESHOLD,
  WS_RECONNECT_BASE,
  WS_RECONNECT_MAX,
} from './constants.js';

describe('platform constants', () => {
  it('HEARTBEAT_INTERVAL is 30_000', () => {
    expect(HEARTBEAT_INTERVAL).toBe(30_000);
  });

  it('OFFLINE_THRESHOLD is 90_000 (3x heartbeat)', () => {
    expect(OFFLINE_THRESHOLD).toBe(90_000);
    expect(OFFLINE_THRESHOLD).toBe(3 * HEARTBEAT_INTERVAL);
  });

  it('WS_RECONNECT_BASE is 1_000', () => {
    expect(WS_RECONNECT_BASE).toBe(1_000);
  });

  it('WS_RECONNECT_MAX is 30_000', () => {
    expect(WS_RECONNECT_MAX).toBe(30_000);
  });
});
