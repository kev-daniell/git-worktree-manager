import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Resolves the original repository directory for a git working tree or repo path
 * using `git rev-parse --git-common-dir`. Returns `undefined` if not a git repo.
 */
export async function resolveOriginalRepo(cwd: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync('git', ['-C', cwd, 'rev-parse', '--git-common-dir']);
    const commonDir = stdout.trim();
    if (!commonDir) {
      return undefined;
    }
    const resolved = path.resolve(cwd, commonDir);
    const repoPath = path.basename(resolved) === '.git' ? path.dirname(resolved) : resolved;
    try {
      return fs.realpathSync(repoPath);
    } catch {
      return repoPath;
    }
  } catch {
    return undefined;
  }
}
