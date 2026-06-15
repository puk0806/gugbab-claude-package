---
name: Storybook 시각 검수용 Playwright 스크립트
description: scripts/visual-check.{mjs,sh}로 Storybook iframe 페이지를 헤드리스 chromium에서 캡처. 시각 회귀 / 레이아웃 겹침 등 진단에 재사용.
type: reference
originSessionId: dae7b45b-3a7d-4ba5-83b4-d274d3166420
---

`scripts/visual-check.{mjs,sh}` — Playwright headless chromium으로 Storybook iframe 페이지를 풀페이지 캡처. 출력은 `/tmp/visual/*.png`.

**의존성:** workspace 루트 devDep `@playwright/test` + chromium 설치됨 (`pnpm exec playwright install chromium`).

**사용법:**

```bash
# 1) Storybook dev 서버를 먼저 띄운다 (다른 터미널)
pnpm sb:dev:mui          # 6006
# 또는
pnpm sb:dev:radix        # 6007

# 2) 검수 (별도 터미널)
bash scripts/visual-check.sh                                  # 18 페이지 모두
bash scripts/visual-check.sh --only foundations               # Foundations 5종만
bash scripts/visual-check.sh --only components                # 컴포넌트 13종만
bash scripts/visual-check.sh --base http://localhost:6007     # radix
bash scripts/visual-check.sh --out /tmp/run2                  # 출력 디렉토리 변경
```

**페이지 목록은 `scripts/visual-check.mjs`의 `PAGES` 배열에 정의.** 새 stories 추가 시 거기 추가하면 된다 (story id는 Storybook 표기 그대로 — `<title-with-dashes>--<story-name>`).

**언제 쓰나:**
- 시각 변경 후 회귀 확인 (예: 토큰/CSS/레이아웃 수정)
- 사용자가 "겹친다", "안 보인다" 등 시각 지적했을 때 확인
- Foundations 페이지 수정 후 텍스트 줄바꿈/그리드 확인
- Phase 6.4(Storybook test runner) 도입 시 기반 인프라

**Read tool로 PNG 직접 보기 가능** (multimodal). 이걸로 사용자 눈을 거치지 않고도 시각 진단 가능.
