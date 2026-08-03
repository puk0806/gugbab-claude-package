export type SseEvent =
    | { type: "chunk"; text: string }
    | { type: "done"; summary?: string }
    | { type: "error"; message: string }
    | { type: "safety_block"; category: string; message: string; resources: Array<{ url?: string; title?: string }> };
