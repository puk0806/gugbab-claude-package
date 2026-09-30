---
name: feedback_report_upstream_asset_bugs
description: 설치본 Claude 자산(.claude/hooks·agents·skills·rules·commands) 버그는 로컬 수정만 하지 말고 원본 레포(00_gugbab-claude) 세션에 전달
metadata:
  node_type: memory
  type: feedback
  originSessionId: f35db723-e646-4a91-90c9-1860c939e8df
  modified: 2026-09-30T04:20:55.671Z
---

`.claude/` 아래 훅·에이전트·스킬·rules·commands는 원본 레포 `00_gugbab-claude`의 `project-install.sh` 설치본이다. 여기서 버그를 찾으면 **원본 세션(ListAgents에서 `00-gugbab-claude-*`)에 SendMessage로 파일:줄·근거·수정안을 전달**하고, 원본 반영 후 재설치로 받는다. 급하면 로컬 수정을 병행하되 원본 전달은 반드시 한다.

**Why:** 2026-09-25 재설치 때 로컬에서만 고쳤던 차단 훅 stderr 수정(c97c5de)·/agent-status 수정(61f9c3c)이 원본 버전으로 덮여 회귀했다. 사용자가 "원본에서부터 고쳐야 한다"를 확인했고, 직접 전달 방식을 승인했다. 원본 세션도 같은 요청을 했다.

**How to apply:** 설치본 파일을 고칠 일이 생기면 먼저 원본 세션에 전달한다. 설치본인지는 `.claude/.install-manifest.json` 목록으로 판별한다. 프로젝트 고유 파일(CLAUDE.md, README.md, memory/, docs/radix-parity 등)은 해당하지 않는다. 관련 메모리: [[project_hooks_system]]
