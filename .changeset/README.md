# Changesets

이 폴더는 [Changesets](https://github.com/changesets/changesets)가 버전 변경 기록을 저장하는 위치입니다.

## 사용법

패키지를 수정한 뒤 changeset을 생성합니다:

```bash
pnpm changeset
```

프롬프트에 따라:
1. 변경된 패키지 선택 (space로 체크)
2. 버전 타입 선택 (`major` / `minor` / `patch`)
3. 변경 요약 작성 (CHANGELOG에 들어갈 문구)

생성된 `.changeset/*.md` 파일을 커밋한다.

## 배포 워크플로우

```bash
# 1. 누적된 changesets로 버전 bump + CHANGELOG 갱신
pnpm changeset:version

# 2. npm에 배포
pnpm changeset:publish
```

CI(GitHub Actions)에서 자동화할 예정 (Phase 6).
