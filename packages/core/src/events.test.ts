import { describe, expect, it } from 'vitest';
import { output, progress, error, result, parts } from './events.js';

describe('output', () => {
  it('creates text output event with default format', () => {
    const event = output('hello');
    expect(event.type).toBe('output');
    expect(event.data).toEqual({ type: 'output', content: 'hello', format: 'text' });
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it('creates output event with custom format', () => {
    const event = output({ text: 'chunk' }, 'llm.delta');
    expect(event.data).toEqual({ type: 'output', content: { text: 'chunk' }, format: 'llm.delta' });
  });

  it('creates output event with structured content', () => {
    const event = output({ files: 3, errors: 0 }, 'json');
    expect(event.data).toEqual({
      type: 'output',
      content: { files: 3, errors: 0 },
      format: 'json',
    });
  });
});

describe('progress', () => {
  it('creates progress event with percent and message', () => {
    const event = progress(75, 'Building...');
    expect(event.type).toBe('output');
    expect(event.data).toEqual({
      type: 'output',
      content: { percent: 75, message: 'Building...' },
      format: 'progress',
    });
  });

  it('creates progress event without message', () => {
    const event = progress(50);
    expect(event.data).toEqual({
      type: 'output',
      content: { percent: 50, message: undefined },
      format: 'progress',
    });
  });
});

describe('error', () => {
  it('creates error event with default recoverable=false', () => {
    const event = error('NOT_FOUND', 'File missing');
    expect(event.type).toBe('error');
    expect(event.data).toEqual({
      type: 'error',
      code: 'NOT_FOUND',
      message: 'File missing',
      recoverable: false,
    });
  });

  it('creates recoverable error event', () => {
    const event = error('TIMEOUT', 'Timed out', true);
    expect(event.data).toEqual({
      type: 'error',
      code: 'TIMEOUT',
      message: 'Timed out',
      recoverable: true,
    });
  });
});

describe('result', () => {
  it('creates success result', () => {
    const event = result(true, 'Done');
    expect(event.type).toBe('result');
    expect(event.data).toEqual({ type: 'result', success: true, output: 'Done' });
  });

  it('creates failure result', () => {
    const event = result(false, 'Failed');
    expect(event.data).toEqual({ type: 'result', success: false, output: 'Failed' });
  });

  it('creates result without output', () => {
    const event = result(true);
    expect(event.data).toEqual({ type: 'result', success: true, output: undefined });
  });

  it('has valid timestamp', () => {
    const before = Date.now();
    const event = result(true);
    expect(event.timestamp).toBeGreaterThanOrEqual(before);
    expect(event.timestamp).toBeLessThanOrEqual(Date.now());
  });

  it('accepts a ContentPart array as output', () => {
    const event = result(true, [
      { type: 'text/markdown', content: '# Done' },
      { type: 'application/json', content: { ok: true } },
    ]);
    expect(event.data).toEqual({
      type: 'result',
      success: true,
      output: [
        { type: 'text/markdown', content: '# Done' },
        { type: 'application/json', content: { ok: true } },
      ],
    });
  });
});

describe('parts', () => {
  it('orders markdown → text → json', () => {
    expect(parts({ markdown: '# m', text: 't', json: { j: 1 } })).toEqual([
      { type: 'text/markdown', content: '# m' },
      { type: 'text/plain', content: 't' },
      { type: 'application/json', content: { j: 1 } },
    ]);
  });

  it('omits absent slots', () => {
    expect(parts({ markdown: '# m' })).toEqual([{ type: 'text/markdown', content: '# m' }]);
    expect(parts({ json: { x: 1 } })).toEqual([{ type: 'application/json', content: { x: 1 } }]);
  });

  it('keeps json: null distinct from absent (null is valid JSON)', () => {
    expect(parts({ json: null })).toEqual([{ type: 'application/json', content: null }]);
    expect(parts({})).toEqual([]);
  });

  it('appends extra parts after canonical ones', () => {
    expect(
      parts({
        markdown: '# m',
        extra: [{ type: 'text/csv', content: 'a,b\n1,2' }],
      })
    ).toEqual([
      { type: 'text/markdown', content: '# m' },
      { type: 'text/csv', content: 'a,b\n1,2' },
    ]);
  });

  it('feeds straight into result()', () => {
    const event = result(true, parts({ markdown: '# Done', json: { ok: true } }));
    expect(event.data).toEqual({
      type: 'result',
      success: true,
      output: [
        { type: 'text/markdown', content: '# Done' },
        { type: 'application/json', content: { ok: true } },
      ],
    });
  });
});
