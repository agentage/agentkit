import { OPENAI_MODEL_NAME } from './index.js';

describe('OpenAI Model', () => {
  test('OPENAI_MODEL_NAME is defined', () => {
    expect(OPENAI_MODEL_NAME).toBe('openai');
  });
});
