import type { SseEvent } from "@gugbab/utils";
import { readSSEStream } from "@gugbab/utils";
import { useCallback, useRef, useState } from "react";

export type SSEChatStatus = "idle" | "streaming" | "done" | "error";

export interface UseSSEChatOptions {
    url: string;
    onChunk?: (text: string) => void;
    onDone?: () => void;
    onError?: (error: Error | (SseEvent & { type: "error" })) => void;
}

export interface UseSSEChatResult {
    text: string;
    status: SSEChatStatus;
    send: (body: unknown) => Promise<void>;
    abort: () => void;
}

export function useSSEChat(options: UseSSEChatOptions): UseSSEChatResult {
    const { url, onChunk, onDone, onError } = options;

    const [text, setText] = useState("");
    const [status, setStatus] = useState<SSEChatStatus>("idle");
    const abortRef = useRef<AbortController | null>(null);
    const generationRef = useRef(0);

    const send = useCallback(
        async (body: unknown) => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const generation = ++generationRef.current;

            setText("");
            setStatus("streaming");

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                if (!response.body) throw new Error("No response body");

                await readSSEStream(response.body, (event: SseEvent) => {
                    // discard events from a superseded request
                    if (generationRef.current !== generation) return;

                    if (event.type === "chunk") {
                        setText((prev) => prev + event.text);
                        onChunk?.(event.text);
                    } else if (event.type === "done") {
                        setStatus("done");
                        onDone?.();
                    } else if (event.type === "error") {
                        setStatus("error");
                        onError?.(event);
                    }
                });

                // stream closed cleanly without explicit done event
                if (generationRef.current === generation) {
                    setStatus((prev) => (prev === "streaming" ? "done" : prev));
                }
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    // only reset to idle if this send() is still current (not replaced by a newer call)
                    if (generation === generationRef.current) {
                        setStatus("idle");
                    }
                    return;
                }
                if (generationRef.current === generation) {
                    setStatus("error");
                    onError?.(err instanceof Error ? err : new Error(String(err)));
                }
            }
        },
        [url, onChunk, onDone, onError],
    );

    const abort = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setStatus("idle");
    }, []);

    return { text, status, send, abort };
}
