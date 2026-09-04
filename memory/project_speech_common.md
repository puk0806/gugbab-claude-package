---
name: speech-common-package
description: Web Speech API(STT/TTS) 공통화 — hooks speech 카테고리 + utils appendTranscript. 형제 앱 3곳 마이그레이션 예정.
metadata: 
  node_type: memory
  type: project
  originSessionId: c5b5da51-0ed4-41ba-a315-b50840ef73fd
  modified: 2026-09-04T00:49:54.557Z
---

2026-09-03 형제 앱 3곳(dream·voca·health)에 복붙돼 있던 마이크(STT)·TTS 모듈을 `@gugbab/hooks` `speech` 카테고리 + `@gugbab/utils` `appendTranscript`로 승격 (feature/speech-common).

**Why:** 3벌 복붙이 이미 갈라짐 — health/voca가 받은 resultIndex 배치 유실 픽스를 dream이 못 받은 상태였다. 공통화로 픽스 1회 전파.

**How to apply:**
- API 설계 고정: 에러는 `MicError` 분류만 반환(문구는 앱이 지정), voice 폴백은 `pickVoice(...) ?? voices[0]`처럼 호출부 정책, `useSpeechRecognition`은 `onFinal` 콜백으로 최종 결과만 전달(입력 반영·상한은 앱 몫)
- 지원 감지는 훅이 실제 호출하는 표면 전체를 검증(부분 구현 WebView 방어) — Codex 리뷰로 강화된 계약이므로 완화하지 말 것
- **3앱 마이그레이션 완료 (2026-09-04)**: dream·voca·health 각각 `feature/speech-common-hooks` 브랜치 푸시 (typecheck·전체 테스트·빌드 tarball 검증 통과). 남은 것: ① 패키지 PR 머지 → hooks 1.3.0·utils 1.4.0 자동 게시 ② 각 앱 브랜치에서 `pnpm install`로 lockfile 갱신 후 머지 ③ 실기기 마이크 수동 확인. `useSpeechRecognition`에 `abort()`는 이 마이그레이션 중 발견한 API 공백으로 추가됨(전송 직후 늦은 최종 결과 파기)
- 로컬 패키지 검증 시 `npm pack`은 `workspace:*`를 실버전으로 치환하지 않음 — **`pnpm pack`** 사용 (실배포는 changesets가 치환)

관련: [[project_react_roadmap]], [[project_npm_v1_publishing]]
