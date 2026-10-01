import type { SseEvent } from "./types";

type SafetyResource = Extract<SseEvent, { type: "safety_block" }>["resources"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Optional string field: `undefined`/`null` → absent, string → kept, anything else → invalid. */
function optionalString(value: unknown): { ok: boolean; value?: string } {
    if (value === undefined || value === null) return { ok: true };
    return typeof value === "string" ? { ok: true, value } : { ok: false };
}

function toResource(value: unknown): SafetyResource | null {
    if (!isRecord(value)) return null;
    const url = optionalString(value.url);
    const title = optionalString(value.title);
    if (!url.ok || !title.ok) return null;
    const resource: SafetyResource = {};
    if (url.value !== undefined) resource.url = url.value;
    if (title.value !== undefined) resource.title = title.value;
    return resource;
}

// Runtime shape check + normalization: the payload comes from the network, so
// the `SseEvent` return type must actually hold. Required fields are strict;
// optional ones tolerate `null` (common in server serializers) and are dropped.
// Unknown fields are not carried over.
function toSseEvent(value: unknown): SseEvent | null {
    if (!isRecord(value)) return null;
    switch (value.type) {
        case "chunk":
            return typeof value.text === "string" ? { type: "chunk", text: value.text } : null;
        case "done": {
            const summary = optionalString(value.summary);
            if (!summary.ok) return null;
            return summary.value === undefined ? { type: "done" } : { type: "done", summary: summary.value };
        }
        case "error":
            return typeof value.message === "string" ? { type: "error", message: value.message } : null;
        case "safety_block": {
            if (typeof value.category !== "string" || typeof value.message !== "string") return null;
            // A missing list must not drop the safety notice itself.
            const raw = value.resources ?? [];
            if (!Array.isArray(raw)) return null;
            const resources: SafetyResource[] = [];
            for (const item of raw) {
                const resource = toResource(item);
                if (!resource) return null;
                resources.push(resource);
            }
            return { type: "safety_block", category: value.category, message: value.message, resources };
        }
        default:
            return null;
    }
}

export function parseSSELine(line: string): SseEvent | null {
    if (!line || line.startsWith(":") || !line.startsWith("data:")) return null;
    const raw = line.slice(5).trim();
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }
    return toSseEvent(parsed);
}
