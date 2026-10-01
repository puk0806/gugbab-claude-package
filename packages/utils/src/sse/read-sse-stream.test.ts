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

    it("passes through done event with summary unchanged", async () => {
        const events: SseEvent[] = [];
        const stream = makeStream(['data: {"type":"done","summary":"summary text"}\n\n']);

        await readSSEStream(stream, (event) => events.push(event));

        expect(events).toEqual([{ type: "done", summary: "summary text" }]);
        const done = events[0];
        expect(done).toBeDefined();
        expect(done?.type === "done" ? done.summary : undefined).toBe("summary text");
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

function makeTrackedStream(chunks: string[], close = true) {
    const cancel = vi.fn();
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
            if (close) controller.close();
        },
        cancel,
    });
    return { stream, cancel };
}

describe("readSSEStream — 버퍼 상한·취소 (DoS·오류 경로)", () => {
    it("개행 없는 라인이 상한을 넘으면 RangeError로 중단하고 스트림을 취소한다", async () => {
        const { stream, cancel } = makeTrackedStream(["data: ", "x".repeat(50), "y".repeat(50)], false);
        await expect(readSSEStream(stream, vi.fn(), { maxBufferSize: 64 })).rejects.toThrow(RangeError);
        expect(cancel).toHaveBeenCalled();
    });

    it("완성된 라인들의 총량이 상한을 넘어도 각 라인이 상한 이내면 정상 처리한다 (경계)", async () => {
        const line = 'data: {"type":"chunk","text":"abcdefghij"}\n';
        const onEvent = vi.fn();
        const { stream } = makeTrackedStream(Array.from({ length: 20 }, () => line));
        await readSSEStream(stream, onEvent, { maxBufferSize: line.length + 1 });
        expect(onEvent).toHaveBeenCalledTimes(20);
    });

    it("onEvent가 throw하면 같은 에러로 reject하고 스트림을 취소한다", async () => {
        const { stream, cancel } = makeTrackedStream(['data: {"type":"chunk","text":"a"}\n'], false);
        const boom = new Error("boom");
        await expect(
            readSSEStream(stream, () => {
                throw boom;
            }),
        ).rejects.toBe(boom);
        expect(cancel).toHaveBeenCalled();
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])("maxBufferSize=%s는 RangeError", async (max) => {
        const { stream } = makeTrackedStream([]);
        await expect(readSSEStream(stream, vi.fn(), { maxBufferSize: max })).rejects.toThrow(RangeError);
    });

    it("옵션 없이 호출하면 기존 동작 그대로다 (하위 호환)", async () => {
        const onEvent = vi.fn();
        const { stream } = makeTrackedStream(['data: {"type":"done"}\n']);
        await readSSEStream(stream, onEvent);
        expect(onEvent).toHaveBeenCalledWith({ type: "done" });
    });
});
