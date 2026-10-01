/** Protocol-neutral events every SSE chat stream shares. */
export type SseCoreEvent =
    | { type: "chunk"; text: string }
    | { type: "done"; summary?: string }
    | { type: "error"; message: string };

/**
 * Safety notice emitted by one specific backend (relay). It lives here only for
 * backward compatibility.
 *
 * @deprecated App-specific. In the next major it is removed from this package
 * (type and parser support). Declare the shape in the consuming app and pass it
 * explicitly: `SseEvent<MySafetyBlockEvent>`.
 */
export type SseSafetyBlockEvent = {
    type: "safety_block";
    category: string;
    message: string;
    resources: Array<{ url?: string; title?: string }>;
};

/**
 * SSE chat event union. `TExtra` adds app-specific events (each must carry a
 * string `type` discriminator); use `SseEvent<never>` for the core events only.
 * The default keeps `SseSafetyBlockEvent` so existing code is unaffected.
 *
 * Type-level only for now: `parseSSELine` / `readSSEStream` / `toSSELine`
 * recognize the core events and `safety_block`; other `type`s are dropped by
 * the parser.
 */
export type SseEvent<TExtra extends { type: string } = SseSafetyBlockEvent> = SseCoreEvent | TExtra;
