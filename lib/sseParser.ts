/**
 * Server-Sent Events (SSE) Stream Frame Parser
 *
 * Implements a robust, defensive parser for SSE streams:
 * - Normalizes and supports both LF (\n) and CRLF (\r\n) line terminators.
 * - Buffers incomplete event frames across arbitrary chunk boundaries.
 * - Flushes trailing buffer contents at stream termination.
 * - Defensively validates payloads and rejects malformed JSON or un-typed events.
 */

export type SSEEvent =
  | { type: 'stage'; stage: string; message: string }
  | { type: 'chunk'; text: string }
  | { type: 'complete'; rawText: string }
  | { type: 'error'; error: string; code?: string; retryable?: boolean };

export class SSEFrameParser {
  private buffer: string = '';

  /**
   * Feeds a decoded text chunk into the parser and emits any complete events.
   */
  public push(chunk: string): SSEEvent[] {
    if (!chunk) return [];
    this.buffer += chunk;
    return this.drain(false);
  }

  /**
   * Flushes any remaining event data when the stream terminates.
   */
  public flush(): SSEEvent[] {
    return this.drain(true);
  }

  /**
   * Internal drainer that splits by double newlines (\n\n or \r\n\r\n).
   */
  private drain(isFinal: boolean): SSEEvent[] {
    const events: SSEEvent[] = [];

    // Standardize CRLF and lone CR to standard LF for unified splitting
    this.buffer = this.buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // SSE event frames are delimited by double newlines (\n\n)
    const frames = this.buffer.split('\n\n');

    if (isFinal) {
      // Stream has closed; process all frames including any trailing non-empty buffer
      this.buffer = '';
    } else {
      // Keep the final slice in buffer in case it is an incomplete frame across chunks
      this.buffer = frames.pop() ?? '';
    }

    for (const frame of frames) {
      const event = this.parseFrame(frame);
      if (event) {
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Parses an individual SSE frame.
   */
  private parseFrame(rawFrame: string): SSEEvent | null {
    const trimmed = rawFrame.trim();
    if (!trimmed) return null;

    const lines = trimmed.split('\n');
    let dataPayload = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('data:')) {
        const content = trimmedLine.slice(5).trim();
        dataPayload += (dataPayload ? '\n' : '') + content;
      }
    }

    if (!dataPayload) return null;

    try {
      const parsed = JSON.parse(dataPayload);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.type !== 'string') {
        return null;
      }
      return parsed as SSEEvent;
    } catch {
      return null;
    }
  }
}
