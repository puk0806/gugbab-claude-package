'use strict';
// SessionStart: symlink 자동 설정 + 원격 최신 memory pull
// setup-memory-link.sh 없이 clone 직후 바로 동작
const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectDir = process.env.CLAUDE_PROJECT_DIR;
if (!projectDir) process.exit(0);

const repoMemory = path.join(projectDir, 'memory');

// Claude 인코딩: / 와 _ 를 모두 - 로 치환
const encoded = projectDir.replace(/[/\_]/g, '-');
const claudeMemory = path.join(os.homedir(), '.claude', 'projects', encoded, 'memory');

// ── 1단계: symlink 자동 설정 ──────────────────────────────────────
(function setupSymlink() {
  try {
    // repo/memory/ 없으면 생성 (fresh clone 대비)
    if (!fs.existsSync(repoMemory)) {
      fs.mkdirSync(repoMemory, { recursive: true });
    }

    let stat;
    try {
      stat = fs.lstatSync(claudeMemory);
    } catch {
      // 아직 없음 → 부모 디렉토리 생성 후 symlink
      fs.mkdirSync(path.dirname(claudeMemory), { recursive: true });
      fs.symlinkSync(repoMemory, claudeMemory);
      return;
    }

    if (stat.isSymbolicLink()) {
      // 이미 symlink → 올바른 대상인지 확인
      if (path.resolve(fs.readlinkSync(claudeMemory)) === path.resolve(repoMemory)) return;
      // 잘못된 대상 → 교체
      fs.unlinkSync(claudeMemory);
      fs.symlinkSync(repoMemory, claudeMemory);
      return;
    }

    if (stat.isDirectory()) {
      // 기존 로컬 디렉토리 → repo로 병합 후 symlink 교체 (하위 디렉토리 포함 재귀 복사)
      try {
        function copyRecursive(src, dst) {
          for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
            const srcPath = path.join(src, entry.name);
            const dstPath = path.join(dst, entry.name);
            if (entry.isDirectory()) {
              if (!fs.existsSync(dstPath)) fs.mkdirSync(dstPath, { recursive: true });
              copyRecursive(srcPath, dstPath);
            } else if (!fs.existsSync(dstPath)) {
              fs.copyFileSync(srcPath, dstPath);
            }
          }
        }
        copyRecursive(claudeMemory, repoMemory);
      } catch {}
      fs.rmSync(claudeMemory, { recursive: true, force: true });
      fs.symlinkSync(repoMemory, claudeMemory);
    }
  } catch {
    // 세션 시작 절대 차단 금지
  }
})();

// ── 2단계: 원격 최신 memory pull (main/master 브랜치에서만) ──────────────
// feature 브랜치에서 실행 시 브랜치 로컬 memory 변경분을 덮어쓸 위험이 있음
const currentBranch = spawnSync('git', ['-C', projectDir, 'branch', '--show-current'], {
  encoding: 'utf8', stdio: 'pipe',
}).stdout?.trim();
if (currentBranch !== 'main' && currentBranch !== 'master') process.exit(0);

const localDirty = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (localDirty.stdout?.trim()) process.exit(0);

spawnSync('git', ['-C', projectDir, 'fetch', 'origin'], { stdio: 'pipe', timeout: 10000 });

// upstream 동적 조회 (origin/main 하드코딩 회피 — master 등 다른 기본 브랜치 지원)
const upstreamRef = spawnSync('git', ['-C', projectDir, 'rev-parse', '--abbrev-ref', '@{u}'], {
  encoding: 'utf8', stdio: 'pipe',
}).stdout?.trim() || `origin/${currentBranch}`;

// 로컬에 아직 push 안 된 memory 커밋이 있으면 덮어쓰기 위험 → 스킵
const unpushed = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', `${upstreamRef}..HEAD`, '--', 'memory/'],
  { encoding: 'utf8', stdio: 'pipe' }
);
if (unpushed.stdout?.trim()) process.exit(0);

const behind = spawnSync(
  'git', ['-C', projectDir, 'log', '--oneline', `HEAD..${upstreamRef}`, '--', 'memory/'],
  { encoding: 'utf8', stdio: 'pipe' }
);
if (!behind.stdout?.trim()) process.exit(0);

// non-memory staged 파일만 pathspec 지정 stash — memory/ 파일은 stash에서 제외
const stagedBefore = spawnSync('git', ['-C', projectDir, 'diff', '--cached', '--name-only'], { encoding: 'utf8', stdio: 'pipe' });
const nonMemory = (stagedBefore.stdout || '').trim().split('\n').filter(f => f && !f.startsWith('memory/'));
let stashed = false;
if (nonMemory.length > 0) {
  const stashResult = spawnSync(
    'git', ['-C', projectDir, 'stash', 'push', '--staged', '-m', 'memory-hook-temp', '--', ...nonMemory],
    { stdio: 'pipe' }
  );
  stashed = stashResult.status === 0;
}

spawnSync('git', ['-C', projectDir, 'checkout', upstreamRef, '--', 'memory/'], { stdio: 'pipe' });

const afterStatus = spawnSync('git', ['-C', projectDir, 'status', '--porcelain', 'memory/'], {
  encoding: 'utf8', stdio: 'pipe',
});
if (afterStatus.stdout?.trim()) {
  spawnSync('git', ['-C', projectDir, 'commit', '-m', '[memory] Modify: sync from remote'], { stdio: 'pipe' });
}

// --index: staged 상태 그대로 복원 (partial staging 유지)
if (stashed) {
  spawnSync('git', ['-C', projectDir, 'stash', 'pop', '--index'], { stdio: 'pipe' });
}

process.exit(0);
