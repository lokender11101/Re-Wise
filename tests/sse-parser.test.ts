import { describe, it, expect } from 'vitest';
import { SSEFrameParser } from '@/lib/sseParser';

describe('Hardened SSE Stream Parser Suite', () => {
  it('parses standard LF-delimited SSE event frames', () => {
    const parser = new SSEFrameParser();
    const rawData = 'data: {"type":"stage","stage":"analyzing","message":"Analyzing notes..."}\n\ndata: {"type":"chunk","text":"Hello"}\n\n';

    const events = parser.push(rawData);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      type: 'stage',
      stage: 'analyzing',
      message: 'Analyzing notes...',
    });
    expect(events[1]).toEqual({
      type: 'chunk',
      text: 'Hello',
    });
  });

  it('parses CRLF (\\r\\n\\r\\n) delimited frames', () => {
    const parser = new SSEFrameParser();
    const rawData = 'data: {"type":"stage","stage":"quiz","message":"Building quiz..."}\r\n\r\ndata: {"type":"chunk","text":"World"}\r\n\r\n';

    const events = parser.push(rawData);
    expect(events).toHaveLength(2);
    expect(events[0].type).toBe('stage');
    expect(events[1]).toEqual({ type: 'chunk', text: 'World' });
  });

  it('buffers and reconstructs incomplete frames split across arbitrary network chunks', () => {
    const parser = new SSEFrameParser();

    // Chunk 1: frame begins but is cut in half
    const chunk1 = 'data: {"type":"chunk","te';
    const events1 = parser.push(chunk1);
    expect(events1).toHaveLength(0); // Nothing complete yet

    // Chunk 2: remainder of frame arrives with terminator
    const chunk2 = 'xt":"Complete token"}\n\n';
    const events2 = parser.push(chunk2);
    expect(events2).toHaveLength(1);
    expect(events2[0]).toEqual({
      type: 'chunk',
      text: 'Complete token',
    });
  });

  it('flushes trailing buffered event upon stream completion even if final double newline is omitted', () => {
    const parser = new SSEFrameParser();

    // Stream ends abruptly with no trailing \n\n
    parser.push('data: {"type":"complete","rawText":"{\\"done\\":true}"}');
    const flushed = parser.flush();

    expect(flushed).toHaveLength(1);
    expect(flushed[0]).toEqual({
      type: 'complete',
      rawText: '{"done":true}',
    });
  });

  it('defensively rejects malformed JSON and objects without a valid type', () => {
    const parser = new SSEFrameParser();
    const payload = 'data: {not valid json\n\ndata: {"notType":"missing"}\n\ndata: {"type":"chunk","text":"valid"}\n\n';

    const events = parser.push(payload);
    // Only the valid frame is emitted
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'chunk',
      text: 'valid',
    });
  });

  it('parses error events emitted during stream generation', () => {
    const parser = new SSEFrameParser();
    const payload = 'data: {"type":"error","error":"Rate limit reached","code":"RATE_LIMIT"}\n\n';

    const events = parser.push(payload);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'error',
      error: 'Rate limit reached',
      code: 'RATE_LIMIT',
    });
  });
});
