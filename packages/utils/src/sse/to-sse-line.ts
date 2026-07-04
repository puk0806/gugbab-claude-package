import type { SseEvent } from "./types";

export function toSSELine(event: SseEvent): string {
    return `data: ${JSON.stringify(event)}\n\n`;
}
