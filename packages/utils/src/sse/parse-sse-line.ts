import type { SseEvent } from "./types";

export function parseSSELine(line: string): SseEvent | null {
    if (!line || line.startsWith(":") || !line.startsWith("data:")) return null;
    const raw = line.slice(5).trim();
    try {
        return JSON.parse(raw) as SseEvent;
    } catch {
        return null;
    }
}
