---
"@gugbab/utils": minor
---

이력 압축 순수 함수 4종 추가 (`history` 모듈)

- `totalContentBytes` — content 합산 UTF-8 바이트 (relay 상한 판정과 동일 기준: TextEncoder)
- `fitMessagesToBudget` — 바이트 예산·개수 상한 초과 시 오래된 왕복부터 드롭, 첫·마지막 role=user 계약 유지
- `compressHistory` — 오래된 assistant 턴 content를 요약으로 교체 (요약이 원문보다 길면 원문 유지)
- `isHistoryValidationError` — relay 400의 `violation === "history-budget"` 구조적 판별 (재시도 신호)

상한 값은 전부 파라미터 주입 — 기본값 상수 내장·타 패키지 의존 없음.
