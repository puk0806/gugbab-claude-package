---
name: speech-common-package
description: Web Speech API(STT/TTS) 공통화 — hooks speech 카테고리 + utils appendTranscript. 형제 앱 3곳 마이그레이션 예정.
metadata: 
  node_type: memory
  type: project
  originSessionId: c5b5da51-0ed4-41ba-a315-b50840ef73fd
  modified: 2026-09-03T23:53:48.274Z
---

2026-09-03 형제 앱 3곳(dream·voca·health)에 복붙돼 있던 마이크(STT)·TTS 모듈을 `@gugbab/hooks` `speech` 카테고리 + `@gugbab/utils` `appendTranscript`로 승격 (feature/speech-common).

**Why:** 3벌 복붙이 이미 갈라짐 — health/voca가 받은 resultIndex 배치 유실 픽스를 dream이 못 받은 상태였다. 공통화로 픽스 1회 전파.

**How to apply:**
- API 설계 고정: 에러는 `MicError` 분류만 반환(문구는 앱이 지정), voice 폴백은 `pickVoice(...) ?? voices[0]`처럼 호출부 정책, `useSpeechRecognition`은 `onFinal` 콜백으로 최종 결과만 전달(입력 반영·상한은 앱 몫)
- 지원 감지는 훅이 실제 호출하는 표면 전체를 검증(부분 구현 WebView 방어) — Codex 리뷰로 강화된 계약이므로 완화하지 말 것
- **다음 단계**: dream·voca·health 3앱을 `@gugbab/hooks` speech로 마이그레이션 (사용자가 "그다음에 각 프로젝트에 넣을 예정"이라 함). dream은 마이그레이션 시 배치 유실 버그 픽스를 자동으로 받음
- 로컬 패키지 검증 시 `npm pack`은 `workspace:*`를 실버전으로 치환하지 않음 — **`pnpm pack`** 사용 (실배포는 changesets가 치환)

관련: [[project_react_roadmap]], [[project_npm_v1_publishing]]
