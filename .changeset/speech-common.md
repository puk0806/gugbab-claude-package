---
"@gugbab/hooks": minor
"@gugbab/utils": minor
---

Web Speech API 공통화 — 형제 앱들에 복붙되어 있던 마이크(STT)·TTS 모듈을 패키지로 승격

- `@gugbab/hooks` 신규 `speech` 카테고리:
  - `useSpeechRecognition` — 음성 인식 훅 (listening/interim/error 상태, stale 인스턴스 가드, start/stop/abort/toggle, 언마운트 abort)
  - `useSpeak` — TTS 훅 (voiceschanged 비동기 로딩 대응, 발화 중 언마운트 cancel)
  - `createRecognizer` — 프레임워크 독립 STT 코어 (lang 파라미터화, resultIndex 배치 유실 방지)
  - `pickVoice` / `listVoices` — voice 선택 유틸 (preferredURI > lang 정확 일치 > primary subtag)
  - `isSpeechRecognitionSupported` / `isSpeechSynthesisSupported` — 부분 구현 방어 포함 지원 감지
- `@gugbab/utils` 신규 `appendTranscript` — 인식 결과 이어붙이기 + 상한 강제 (서로게이트 쌍 안전 절단)
