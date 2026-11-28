import { describe, beforeAll, afterAll, it, expect } from 'bun:test';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { resolveOriginalRepo } from '../src/git';
import { formatWorktreesConcise, groupByWorktree } from '../src/commands/list';
import { Worktree } from '../src/types';

describe('originalRepo tracking', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'wtmg-origin-test-'));
  const repoDir = path.join(tempRoot, 'my-repo');
  const worktreeDir = path.join(tempRoot, 'feat-my-repo');
  const nonGitDir = path.join(tempRoot, 'not-a-repo');

  beforeAll(() => {
    fs.mkdirSync(repoDir, { recursive: true });
    fs.mkdirSync(nonGitDir, { recursive: true });

    execFileSync('git', ['init'], { cwd: repoDir });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: repoDir });
    execFileSync('git', ['config', 'user.name', 'Test User'], { cwd: repoDir });
    fs.writeFileSync(path.join(repoDir, 'README.md'), '# test\n');
    execFileSync('git', ['add', 'README.md'], { cwd: repoDir });
    execFileSync('git', ['commit', '-m', 'init'], { cwd: repoDir });
    execFileSync('git', ['worktree', 'add', '-b', 'feat', worktreeDir], { cwd: repoDir });
  });

  afterAll(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('resolveOriginalRepo returns the repo root from the main repo', async () => {
    const resolved = await resolveOriginalRepo(repoDir);
    expect(resolved).toBe(fs.realpathSync(repoDir));
  });

  it('resolveOriginalRepo returns the original repo root from a linked worktree', async () => {
    const resolved = await resolveOriginalRepo(worktreeDir);
    expect(resolved).toBe(fs.realpathSync(repoDir));
  });

  it('resolveOriginalRepo returns undefined for a non-git directory', async () => {
    const resolved = await resolveOriginalRepo(nonGitDir);
    expect(resolved).toBeUndefined();
  });

  it('groupByWorktree partitions by originalRepo and formatWorktreesConcise formats repo names and cwd', async () => {
    const worktrees: Worktree[] = [
      { name: 'feat-a', path: '/tmp/feat-a', originalRepo: '/repos/alpha' },
      { name: 'feat-b', path: '/tmp/feat-b', originalRepo: '/repos/beta' },
      { name: 'feat-c', path: '/tmp/feat-c', originalRepo: '/repos/alpha' },
      { name: 'legacy', path: nonGitDir },
    ];

    const partition = await groupByWorktree(worktrees);
    expect(Array.from(partition.keys())).toEqual(['/repos/alpha', '/repos/beta', '']);

    const output = formatWorktreesConcise(partition, '/tmp/feat-c');
    expect(output).toBe(
      [
        '    alpha\n    feat-a\n  * feat-c',
        '    beta\n    feat-b',
        '    Unknown repo\n    legacy',
      ].join('\n\n')
    );

    const repoCwdOutput = formatWorktreesConcise(partition, '/repos/alpha');
    expect(repoCwdOutput).toContain('  * alpha\n    feat-a\n    feat-c');
  });

  it('groupByWorktree backfills and persists missing originalRepo when resolved', async () => {
    const worktrees: Worktree[] = [{ name: 'feat', path: worktreeDir }];
    let persisted: Worktree[] | undefined;

    const partition = await groupByWorktree(worktrees, (updated) => {
      persisted = updated;
    });

    const expectedRepo = fs.realpathSync(repoDir);
    expect(Array.from(partition.keys())).toEqual([expectedRepo]);
    expect(worktrees[0].originalRepo).toBe(expectedRepo);
    expect(persisted).toEqual([{ name: 'feat', path: worktreeDir, originalRepo: expectedRepo }]);
  });
});
