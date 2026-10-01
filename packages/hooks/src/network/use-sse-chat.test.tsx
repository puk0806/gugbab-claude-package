import { act, render, renderHook } from "@testing-library/react";
import { Activity } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type UseSSEChatResult, useSSEChat } from "./use-sse-chat";

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

    it("passes the done event with summary to onDone", async () => {
        const onDone = vi.fn();
        vi.mocked(fetch).mockResolvedValue(makeSSEResponse(['data: {"type":"done","summary":"대화 요약"}\n\n']));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onDone }));

        await act(async () => {
            await result.current.send({});
        });

        expect(onDone).toHaveBeenCalledWith({ type: "done", summary: "대화 요약" });
    });

    it("passes the done event without summary to onDone (backward compat)", async () => {
        const onDone = vi.fn();
        vi.mocked(fetch).mockResolvedValue(makeSSEResponse(['data: {"type":"done"}\n\n']));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onDone }));

        await act(async () => {
            await result.current.send({});
        });

        expect(onDone).toHaveBeenCalledWith({ type: "done" });
    });

    it("accepts a zero-argument onDone callback (existing consumers)", async () => {
        let called = false;
        const onDone = () => {
            called = true;
        };
        vi.mocked(fetch).mockResolvedValue(makeSSEResponse(['data: {"type":"done","summary":"s"}\n\n']));

        const { result } = renderHook(() => useSSEChat({ url: "/api/chat", onDone }));

        await act(async () => {
            await result.current.send({});
        });

        expect(called).toBe(true);
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

    describe("언마운트 (경쟁·누수)", () => {
        function controllableFetch() {
            let controller!: ReadableStreamDefaultController<Uint8Array>;
            let signal: AbortSignal | undefined;
            const body = new ReadableStream<Uint8Array>({
                start(c) {
                    controller = c;
                },
            });
            vi.mocked(fetch).mockImplementation((_url, init) => {
                signal = init?.signal ?? undefined;
                return Promise.resolve(new Response(body, { status: 200 }));
            });
            const push = (line: string) => controller.enqueue(new TextEncoder().encode(line));
            return { push, close: () => controller.close(), getSignal: () => signal };
        }

        it("언마운트하면 진행 중인 fetch를 abort하고 이후 chunk 콜백을 호출하지 않는다", async () => {
            const onChunk = vi.fn();
            const net = controllableFetch();
            const { result, unmount } = renderHook(() => useSSEChat({ url: "/api/chat", onChunk }));

            let pending!: Promise<void>;
            act(() => {
                pending = result.current.send({});
            });
            await act(async () => {
                net.push('data: {"type":"chunk","text":"a"}\n');
                await Promise.resolve();
            });
            await vi.waitFor(() => expect(onChunk).toHaveBeenCalledWith("a"));

            unmount();
            expect(net.getSignal()?.aborted).toBe(true);

            net.push('data: {"type":"chunk","text":"b"}\n');
            net.close();
            await pending;

            expect(onChunk).toHaveBeenCalledTimes(1);
        });

        it("Activity로 숨겨 effect만 정리돼도 요청을 끊고 status가 streaming에 멈추지 않는다", async () => {
            const net = controllableFetch();
            let latest!: UseSSEChatResult;
            function Chat() {
                latest = useSSEChat({ url: "/api/chat" });
                return null;
            }
            const { rerender } = render(
                <Activity mode="visible">
                    <Chat />
                </Activity>,
            );

            act(() => {
                void latest.send({});
            });
            expect(latest.status).toBe("streaming");

            rerender(
                <Activity mode="hidden">
                    <Chat />
                </Activity>,
            );
            expect(net.getSignal()?.aborted).toBe(true);

            rerender(
                <Activity mode="visible">
                    <Chat />
                </Activity>,
            );
            await act(async () => {
                await Promise.resolve();
            });
            expect(latest.status).toBe("idle");
        });

        it("요청 없이 언마운트해도 오류가 없다 (경계)", () => {
            const { unmount } = renderHook(() => useSSEChat({ url: "/api/chat" }));
            expect(() => unmount()).not.toThrow();
        });
    });
});
