---
name: speech-common-package
description: Web Speech API(STT/TTS) 공통화 — hooks speech 카테고리 + utils appendTranscript. 형제 앱 3곳 마이그레이션 예정.
metadata: 
  node_type: memory
  type: project
  originSessionId: c5b5da51-0ed4-41ba-a315-b50840ef73fd
  modified: 2026-10-01T01:32:40.112Z
---

2026-09-03 형제 앱 3곳(dream·voca·health)에 복붙돼 있던 마이크(STT)·TTS 모듈을 `@gugbab/hooks` `speech` 카테고리 + `@gugbab/utils` `appendTranscript`로 승격 (feature/speech-common).

**Why:** 3벌 복붙이 이미 갈라짐 — health/voca가 받은 resultIndex 배치 유실 픽스를 dream이 못 받은 상태였다. 공통화로 픽스 1회 전파.

**How to apply:**
- API 설계 고정: 에러는 `MicError` 분류만 반환(문구는 앱이 지정), voice 폴백은 `pickVoice(...) ?? voices[0]`처럼 호출부 정책, `useSpeechRecognition`은 `onFinal` 콜백으로 최종 결과만 전달(입력 반영·상한은 앱 몫)
- 지원 감지는 훅이 실제 호출하는 표면 전체를 검증(부분 구현 WebView 방어) — Codex 리뷰로 강화된 계약이므로 완화하지 말 것
- **게시·마이그레이션 완료 (2026-09-04)**: 패키지 PR #42 머지 → Version PR #43 auto-merge → **hooks 1.3.0·utils 1.4.0 npm 게시 확인**. dream·voca·health 3앱 `feature/speech-common-hooks` 브랜치에 마이그레이션 + 게시 버전 lockfile 갱신까지 푸시 완료 (typecheck·전체 테스트·빌드 검증 통과). `useSpeechRecognition`의 `abort()`는 마이그레이션 중 발견한 API 공백으로 추가(전송 직후 늦은 최종 결과 파기)
- **남은 것**: ① 앱 PR 3개는 사용자가 직접 생성·머지 (2026-09-04 기준 미완 — 머지 여부 확인 필요) ② 실기기 마이크 수동 확인 (ko-KR: dream·health / en-US: voca)
- dream 레포 main에는 당시 타 세션의 대규모 미커밋 WIP가 있었음 — 마이그레이션은 stash 격리 후 main 기준 브랜치로 수행하고 WIP는 복원해 둠
- 로컬 패키지 검증 시 `npm pack`은 `workspace:*`를 실버전으로 치환하지 않음 — **`pnpm pack`** 사용 (실배포는 changesets가 치환)

관련: [[project_react_roadmap]], [[project_npm_v1_publishing]]
