const encoder = new TextEncoder();

/**
 * 예산 초과 시 오래된 왕복(user 턴 + 뒤따르는 assistant 응답들)부터 드롭해
 * content 합산 UTF-8 바이트를 budgetBytes 이내로 맞춘다.
 * maxMessages를 주면 메시지 개수 상한도 함께 맞춘다.
 *
 * relay의 messages[] 계약(첫·마지막 role=user)을 지킨다:
 * - 선두 assistant·꼬리 assistant 메시지는 예산과 무관하게 제거한다
 * - user 메시지가 하나도 없으면 계약을 만족할 수 없으므로 빈 배열을 반환한다
 * - 마지막 user 턴은 절대 드롭하지 않는다 — 그 턴 혼자 예산을 초과해도
 *   그대로 반환한다 (개별 메시지 길이 초과는 드롭으로 해결할 수 없는 유형)
 */
export function fitMessagesToBudget<T extends { role: "user" | "assistant"; content: string }>(
    messages: readonly T[],
    budgetBytes: number,
    maxMessages?: number,
): T[] {
    if (Number.isNaN(budgetBytes) || budgetBytes < 0) {
        throw new RangeError(`budgetBytes must be a non-negative number, received ${String(budgetBytes)}`);
    }
    if (maxMessages !== undefined && (!Number.isInteger(maxMessages) || maxMessages < 1)) {
        throw new RangeError(`maxMessages must be a positive integer, received ${String(maxMessages)}`);
    }

    let lastIndex = messages.length - 1;
    while (lastIndex >= 0 && messages[lastIndex]?.role !== "user") {
        lastIndex--;
    }
    if (lastIndex < 0) {
        return [];
    }

    const bytesOf = messages.map((message) => encoder.encode(message.content).byteLength);

    let start = 0;
    while (start < lastIndex && messages[start]?.role === "assistant") {
        start++;
    }

    let bytes = 0;
    for (let i = start; i <= lastIndex; i++) {
        bytes += bytesOf[i] ?? 0;
    }

    while (
        start < lastIndex &&
        (bytes > budgetBytes || (maxMessages !== undefined && lastIndex - start + 1 > maxMessages))
    ) {
        bytes -= bytesOf[start] ?? 0;
        start++;
        while (start < lastIndex && messages[start]?.role === "assistant") {
            bytes -= bytesOf[start] ?? 0;
            start++;
        }
    }

    return messages.slice(start, lastIndex + 1);
}
