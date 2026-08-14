const encoder = new TextEncoder();

/**
 * 메시지 content의 UTF-8 바이트 합산.
 * relay의 이력 총량 상한 판정과 동일한 기준(TextEncoder)을 사용한다.
 */
export function totalContentBytes(messages: ReadonlyArray<{ content: string }>): number {
    let total = 0;
    for (const message of messages) {
        total += encoder.encode(message.content).byteLength;
    }
    return total;
}
