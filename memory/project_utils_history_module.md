---
name: utils-history-module
description: "utils 1.3.0 history 모듈 — relay 입력 상한 대응 순수 함수 4종, 상수 주입 원칙"
metadata: 
  node_type: memory
  type: project
  originSessionId: 6d7597c7-b563-4e8f-bf7f-a256b5840efd
  modified: 2026-08-14T02:42:29.947Z
---

relay가 2026-08-14부터 입력 상한(메시지 20,000자 / 100개 / 합산 UTF-8 100,000바이트)을 강제하면서
health·dream 앱 공용 이력 압축 로직을 `@gugbab/utils` `history` 모듈(1.3.0)로 공통화함.

**확정된 설계 원칙 (사용자 결정, 2026-08-14):**
- **순수 함수만** — 상한 값은 전부 파라미터 주입. 기본값 상수 내장 금지, `@gugbab/relay-types` 등 타 패키지 의존 금지
- 상수는 각 소비 앱이 자기 const로 정의 (참조 소스: relay OpenAPI 루트 `x-relay-limits`)
- 초기 핸드오프에 있던 "types-generator가 RELAY_LIMITS 상수 생성" 방안은 폐기됨

함수 4종: `totalContentBytes`(TextEncoder 기준), `fitMessagesToBudget`(왕복 단위 드롭, 첫·마지막
role=user 계약 보장), `compressHistory`(오래된 assistant 턴 요약 교체, 총량 증가 방지),
`isHistoryValidationError`(`violation === "history-budget"` 구조적 판별 — message-size는 false로
재시도 루프 차단, 필드 없는 구버전 relay엔 안전 퇴화).

relay 400의 `violation` 필드("history-budget" | "message-size")는 relay 레포에 구현 완료·배포 대기
상태였음 — 배포되면 dispatch로 [[relay-types-generator]] 파이프라인이 재생성. 앱 적용 가이드는
relay 레포 `docs/handoff/health-history-compression-prompt.md`, `dream-limit-handling-prompt.md`.
