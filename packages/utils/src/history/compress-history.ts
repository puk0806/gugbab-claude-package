const encoder = new TextEncoder();

export interface CompressHistoryOptions<T> {
    /** 요약 문자열 반환 시 교체, undefined 반환 시 원문 유지. index는 원본 배열 기준 */
    getSummary: (msg: T, index: number) => string | undefined;
    /** 원문을 그대로 보존할 최근 왕복 수 — 뒤에서 keepRecentTurns번째 user 턴부터 보호 */
    keepRecentTurns: number;
}

/**
 * 오래된 assistant 턴의 content를 요약으로 교체한다. user 메시지는 건드리지 않는다.
 * 요약이 원문보다 UTF-8 바이트가 작지 않으면(교체 이득 없음) 원문을 유지하므로
 * 결과의 content 합산 바이트는 절대 늘어나지 않는다.
 */
export function compressHistory<T extends { role: "user" | "assistant"; content: string }>(
    messages: readonly T[],
    options: CompressHistoryOptions<T>,
): T[] {
    const { getSummary, keepRecentTurns } = options;
    if (!Number.isInteger(keepRecentTurns) || keepRecentTurns < 0) {
        throw new RangeError(`keepRecentTurns must be a non-negative integer, received ${String(keepRecentTurns)}`);
    }

    let protectedFrom = messages.length;
    let remainingTurns = keepRecentTurns;
    for (let i = messages.length - 1; i >= 0 && remainingTurns > 0; i--) {
        if (messages[i]?.role === "user") {
            protectedFrom = i;
            remainingTurns--;
        }
    }
    if (remainingTurns > 0) {
        protectedFrom = 0;
    }

    return messages.map((message, index) => {
        if (index >= protectedFrom || message.role !== "assistant") {
            return message;
        }
        const summary = getSummary(message, index);
        if (summary === undefined) {
            return message;
        }
        const isShorter = encoder.encode(summary).byteLength < encoder.encode(message.content).byteLength;
        return isShorter ? { ...message, content: summary } : message;
    });
}
