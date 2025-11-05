import { describe, expect, it } from '@jest/globals';
import {
  AgentKitError,
  MissingApiKeyError,
  NotImplementedError,
  ToolNotFoundError,
  UnsupportedModelError,
} from './errors.js';

describe('Error Classes', () => {
  describe('AgentKitError', () => {
    it('should create base error with correct name and message', () => {
      const error = new AgentKitError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AgentKitError);
      expect(error.name).toBe('AgentKitError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('UnsupportedModelError', () => {
    it('should create error with model name', () => {
      const error = new UnsupportedModelError('claude-3');

      expect(error).toBeInstanceOf(AgentKitError);
      expect(error.name).toBe('UnsupportedModelError');
      expect(error.message).toBe('Model claude-3 is not supported');
    });
  });

  describe('MissingApiKeyError', () => {
    it('should create error with helpful message', () => {
      const error = new MissingApiKeyError();

      expect(error).toBeInstanceOf(AgentKitError);
      expect(error.name).toBe('MissingApiKeyError');
      expect(error.message).toContain('API key is required');
      expect(error.message).toContain('OPENAI_API_KEY');
    });
  });

  describe('ToolNotFoundError', () => {
    it('should create error with tool name', () => {
      const error = new ToolNotFoundError('search');

      expect(error).toBeInstanceOf(AgentKitError);
      expect(error.name).toBe('ToolNotFoundError');
      expect(error.message).toBe('Tool "search" not found');
    });
  });

  describe('NotImplementedError', () => {
    it('should create error with feature name', () => {
      const error = new NotImplementedError('Agent.stream()');

      expect(error).toBeInstanceOf(AgentKitError);
      expect(error.name).toBe('NotImplementedError');
      expect(error.message).toBe('Agent.stream() is not yet implemented');
    });
  });
});
