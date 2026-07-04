import { describe, expect, it, vi } from "vitest";
import { readSSEStream } from "./read-sse-stream";
import type { SseEvent } from "./types";

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(new TextEncoder().encode(chunk));
            }
            controller.close();
        },
    });
}

describe("readSSEStream", () => {
    it("calls onEvent for each valid SSE data line", async () => {
        const onEvent = vi.fn();
        const stream = makeStream(['data: {"type":"chunk","text":"hello"}\n\ndata: {"type":"done"}\n\n']);

        await readSSEStream(stream, onEvent);

        expect(onEvent).toHaveBeenCalledTimes(2);
        expect(onEvent).toHaveBeenNthCalledWith(1, { type: "chunk", text: "hello" });
        expect(onEvent).toHaveBeenNthCalledWith(2, { type: "done" });
    });

    it("handles chunks split across multiple reads", async () => {
        const onEvent = vi.fn();
        const stream = makeStream(['data: {"type":"chunk",', '"text":"split"}\n\n']);

        await readSSEStream(stream, onEvent);

        expect(onEvent).toHaveBeenCalledWith({ type: "chunk", text: "split" });
    });

    it("skips comment and empty lines", async () => {
        const onEvent = vi.fn();
        const stream = makeStream([': ping\n\ndata: {"type":"done"}\n\n']);

        await readSSEStream(stream, onEvent);

        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent).toHaveBeenCalledWith({ type: "done" });
    });

    it("resolves when stream ends", async () => {
        const stream = makeStream([]);
        await expect(readSSEStream(stream, vi.fn())).resolves.toBeUndefined();
    });

    it("skips lines with invalid JSON without throwing", async () => {
        const onEvent = vi.fn();
        const stream = makeStream(['data: bad-json\n\ndata: {"type":"done"}\n\n']);

        await readSSEStream(stream, onEvent);

        expect(onEvent).toHaveBeenCalledTimes(1);
        expect(onEvent).toHaveBeenCalledWith({ type: "done" });
    });
});
