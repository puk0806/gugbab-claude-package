import { parseSSELine } from "./parse-sse-line";
import type { SseEvent } from "./types";

export async function readSSEStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: SseEvent) => void,
): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                const event = parseSSELine(line);
                if (event) onEvent(event);
            }
        }

        // flush decoder's internal multibyte buffer, then process any remaining lines
        buffer += decoder.decode();
        for (const line of buffer.split("\n")) {
            const event = parseSSELine(line);
            if (event) onEvent(event);
        }
    } finally {
        reader.releaseLock();
    }
}
