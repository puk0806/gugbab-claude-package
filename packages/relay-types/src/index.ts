export type { components, operations, paths } from "./generated.js";

import type { components } from "./generated.js";

export type AppType = components["schemas"]["AppType"];
export type MessageRole = components["schemas"]["MessageRole"];
export type ModelAlias = components["schemas"]["ModelAlias"];
export type Message = components["schemas"]["Message"];
export type ChatRequest = components["schemas"]["ChatRequest"];
export type SSEChunk = components["schemas"]["SSEChunk"];
export type SSEDone = components["schemas"]["SSEDone"];
export type SSEError = components["schemas"]["SSEError"];
export type SSEEvent = components["schemas"]["SSEEvent"];
export type ErrorCode = components["schemas"]["ErrorCode"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];
export type ModelInfo = components["schemas"]["ModelInfo"];
export type ModelsResponse = components["schemas"]["ModelsResponse"];
