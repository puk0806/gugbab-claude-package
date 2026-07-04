export type SseEvent =
    | { type: "chunk"; text: string }
    | { type: "done" }
    | { type: "error"; message: string }
    | { type: "safety_block"; category: string; message: string; resources: Array<{ url?: string; title?: string }> };
