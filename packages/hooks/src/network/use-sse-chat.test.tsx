import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSSEChat } from "./use-sse-chat";

function makeSSEResponse(lines: string[]): Response {
    const body = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const line of lines) {
                controller.enqueue(new TextEncoder().encode(line));
            }
            controller.close();
        },
    });
    return new Response(body, { status: 200 });
}

describe("useSSEChat", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts in idle state", () => {
        const { result } = renderHook(() => useSSEChat({ url: "/api/chat" }));
        expect(result.current.status).toBe("idle");
        expect(result.current.text).toBe("");
    });

    it("accumulates chunk text while streaming", async () => {
        vi.mocked(fetch).mockResolvedValue(
            makeSSEResponse([
                'data: {"type":"chunk","text":"hello"}\n\n',
                'data: {"type":"chunk","text":" world"}\n\n',
                'data: {"type":"done"}\n\n',
            ]),
        );

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat" }));

        await act(async () => {
            await result.current.send({ message: "hi" });
        });

        expect(result.current.text).toBe("hello world");
        expect(result.current.status).toBe("done");
    });

    it("calls onChunk for each text chunk", async () => {
        const onChunk = vi.fn();
        vi.mocked(fetch).mockResolvedValue(
            makeSSEResponse(['data: {"type":"chunk","text":"a"}\n\n', 'data: {"type":"done"}\n\n']),
        );

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onChunk }));

        await act(async () => {
            await result.current.send({});
        });

        expect(onChunk).toHaveBeenCalledWith("a");
    });

    it("calls onDone when stream ends", async () => {
        const onDone = vi.fn();
        vi.mocked(fetch).mockResolvedValue(makeSSEResponse(['data: {"type":"done"}\n\n']));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onDone }));

        await act(async () => {
            await result.current.send({});
        });

        expect(onDone).toHaveBeenCalledTimes(1);
    });

    it("sets status to error and calls onError on fetch failure", async () => {
        const onError = vi.fn();
        vi.mocked(fetch).mockRejectedValue(new Error("network error"));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onError }));

        await act(async () => {
            await result.current.send({});
        });

        expect(result.current.status).toBe("error");
        expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("sets status to error when SSE error event received", async () => {
        const onError = vi.fn();
        vi.mocked(fetch).mockResolvedValue(makeSSEResponse(['data: {"type":"error","message":"server error"}\n\n']));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onError }));

        await act(async () => {
            await result.current.send({});
        });

        expect(result.current.status).toBe("error");
        expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "server error" }));
    });

    it("abort() cancels an in-flight request", async () => {
        let resolveStream!: () => void;
        const neverEndingStream = new ReadableStream<Uint8Array>({
            start(controller) {
                resolveStream = () => controller.close();
            },
        });
        vi.mocked(fetch).mockResolvedValue(new Response(neverEndingStream));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat" }));

        // don't await — let it stream
        act(() => {
            result.current.send({});
        });

        await act(async () => {
            result.current.abort();
        });

        expect(result.current.status).toBe("idle");
        resolveStream();
    });
});
