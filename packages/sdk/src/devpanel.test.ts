import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getDevPanel,
  initDevPanel,
  showDevPanel,
  clearDevPanel,
} from './devpanel.js';

describe('DevPanel', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
    clearDevPanel();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('initialization', () => {
    it('should be disabled by default in non-dev environment', () => {
      process.env.NODE_ENV = 'production';
      const panel = initDevPanel();
      expect(panel.isEnabled()).toBe(false);
    });

    it('should be enabled in development environment', () => {
      process.env.NODE_ENV = 'development';
      const panel = initDevPanel();
      expect(panel.isEnabled()).toBe(true);
    });

    it('should respect explicit enabled config', () => {
      process.env.NODE_ENV = 'production';
      const panel = initDevPanel({ enabled: true });
      expect(panel.isEnabled()).toBe(true);
    });

    it('should respect explicit disabled config', () => {
      process.env.NODE_ENV = 'development';
      const panel = initDevPanel({ enabled: false });
      expect(panel.isEnabled()).toBe(false);
    });
  });

  describe('event logging', () => {
    it('should log events when enabled', () => {
      const panel = initDevPanel({ enabled: true });
      
      panel.log({
        type: 'message',
        timestamp: new Date(),
        data: { test: 'data' },
      });

      const events = panel.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('message');
    });

    it('should not log events when disabled', () => {
      const panel = initDevPanel({ enabled: false });
      
      panel.log({
        type: 'message',
        timestamp: new Date(),
        data: { test: 'data' },
      });

      const events = panel.getEvents();
      expect(events).toHaveLength(0);
    });

    it('should track different event types', () => {
      const panel = initDevPanel({ enabled: true });
      
      const eventTypes: Array<'config' | 'message' | 'tool_call' | 'response' | 'error'> = [
        'config',
        'message',
        'tool_call',
        'response',
        'error',
      ];

      eventTypes.forEach((type) => {
        panel.log({
          type,
          timestamp: new Date(),
          data: { type },
        });
      });

      const events = panel.getEvents();
      expect(events).toHaveLength(5);
      expect(events.map((e) => e.type)).toEqual(eventTypes);
    });
  });

  describe('event clearing', () => {
    it('should clear all logged events', () => {
      const panel = initDevPanel({ enabled: true });
      
      panel.log({
        type: 'message',
        timestamp: new Date(),
        data: { test: 'data' },
      });

      expect(panel.getEvents()).toHaveLength(1);
      
      panel.clear();
      
      expect(panel.getEvents()).toHaveLength(0);
    });
  });

  describe('global instance', () => {
    it('should return the same instance', () => {
      const panel1 = getDevPanel();
      const panel2 = getDevPanel();
      expect(panel1).toBe(panel2);
    });

    it('should work with global functions', () => {
      const panel = initDevPanel({ enabled: true });
      
      panel.log({
        type: 'message',
        timestamp: new Date(),
        data: { test: 'data' },
      });

      expect(getDevPanel().getEvents()).toHaveLength(1);
      
      clearDevPanel();
      
      expect(getDevPanel().getEvents()).toHaveLength(0);
    });
  });

  describe('show panel', () => {
    it('should not throw when showing panel', () => {
      const panel = initDevPanel({ enabled: true });
      
      panel.log({
        type: 'message',
        timestamp: new Date(),
        data: { test: 'data' },
      });

      expect(() => panel.show()).not.toThrow();
      expect(() => showDevPanel()).not.toThrow();
    });

    it('should handle empty events', () => {
      const panel = initDevPanel({ enabled: true });
      expect(() => panel.show()).not.toThrow();
    });

    it('should show message when disabled', () => {
      const panel = initDevPanel({ enabled: false });
      expect(() => panel.show()).not.toThrow();
    });
  });
});
