import { parseSSELine } from "./parse-sse-line";
import type { SseEvent } from "./types";

export interface ReadSSEStreamOptions {
    /**
     * Max length (UTF-16 code units) of the unterminated tail kept between
     * reads. A peer that never sends a newline would otherwise grow the buffer
     * without bound. Complete lines that arrive within a single chunk are not
     * limited here — they are already in memory. Default: 1,048,576.
     */
    maxBufferSize?: number;
}

const DEFAULT_MAX_BUFFER_SIZE = 1_048_576;

export async function readSSEStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: SseEvent) => void,
    options: ReadSSEStreamOptions = {},
): Promise<void> {
    const maxBufferSize = options.maxBufferSize ?? DEFAULT_MAX_BUFFER_SIZE;
    if (!Number.isFinite(maxBufferSize) || maxBufferSize <= 0) {
        throw new RangeError(`maxBufferSize must be a positive finite number (received ${maxBufferSize})`);
    }

    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const emit = (line: string) => {
        const event = parseSSELine(line);
        if (event) onEvent(event);
    };

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) emit(line);

            if (buffer.length > maxBufferSize) {
                throw new RangeError(`SSE line exceeded maxBufferSize (${maxBufferSize} characters)`);
            }
        }

        // flush decoder's internal multibyte buffer, then process any remaining lines
        buffer += decoder.decode();
        for (const line of buffer.split("\n")) emit(line);
    } catch (error) {
        // Stop the producer — otherwise the connection stays open after we give up.
        // Not awaited: a source whose cancel() never settles must not swallow the error.
        void reader.cancel(error).catch(() => {});
        throw error;
    } finally {
        reader.releaseLock();
    }
}
