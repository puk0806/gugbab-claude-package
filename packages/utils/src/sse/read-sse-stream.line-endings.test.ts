import { describe, expect, it, vi } from "vitest";
import { readSSEStream } from "./read-sse-stream";

function makeStream(chunks: Array<string | Uint8Array>): ReadableStream<Uint8Array> {
    return new ReadableStream({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
            }
            controller.close();
        },
    });
}

describe("readSSEStream — 줄 구분자 (WHATWG event-stream: CRLF·LF·CR)", () => {
    it("CR 단독 구분자도 줄로 나눈다", async () => {
        const onEvent = vi.fn();
        await readSSEStream(makeStream(['data: {"type":"done"}\r\rdata: {"type":"done"}\r\r']), onEvent);
        expect(onEvent).toHaveBeenCalledTimes(2);
    });

    it("CR 만 쓰는 서버가 상한보다 긴 스트림을 보내도 줄 단위로 처리돼 상한에 걸리지 않는다 (경계)", async () => {
        const onEvent = vi.fn();
        const line = 'data: {"type":"chunk","text":"x"}\r';
        await readSSEStream(makeStream(Array.from({ length: 50 }, () => line)), onEvent, { maxBufferSize: 100 });
        expect(onEvent).toHaveBeenCalledTimes(50);
    });

    it("청크 경계에서 갈라진 CRLF 는 이벤트를 중복·유실하지 않는다 (경계)", async () => {
        const onEvent = vi.fn();
        await readSSEStream(makeStream(['data: {"type":"done"}\r', '\ndata: {"type":"done"}\r\n']), onEvent);
        expect(onEvent).toHaveBeenCalledTimes(2);
    });

    it("맨 앞 UTF-8 BOM 이 있어도 첫 이벤트를 잃지 않는다", async () => {
        const onEvent = vi.fn();
        const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
        await readSSEStream(makeStream([bom, 'data: {"type":"done"}\n']), onEvent);
        expect(onEvent).toHaveBeenCalledTimes(1);
    });

    it("개행 없이 상한을 넘는 줄은 여전히 거부한다 (보안)", async () => {
        const onEvent = vi.fn();
        await expect(
            readSSEStream(makeStream(["x".repeat(60), "y".repeat(60)]), onEvent, { maxBufferSize: 100 }),
        ).rejects.toThrow(RangeError);
    });
});
