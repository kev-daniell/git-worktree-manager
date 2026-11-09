import fs from 'fs';
import path from 'path';
import { Worktree } from './types';
import { STATE_FILE_PATH } from './config';
import { logger } from './logger';
import { getProviderByName } from './plugins';

const LOCK_FILE_PATH = `${STATE_FILE_PATH}.lock`;
const LOCK_TIMEOUT_MS = 15_000;
const LOCK_STALE_MS = 10_000;
let lockHeld = false;

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Runs `fn` while holding an exclusive cross-process lock on the state file,
 * so concurrent read-modify-write cycles cannot overwrite each other.
 * Re-entrant within a single process.
 */
function withStateLock<T>(fn: () => T): T {
  if (lockHeld) {
    return fn();
  }

  fs.mkdirSync(path.dirname(LOCK_FILE_PATH), { recursive: true });
  const deadline = Date.now() + LOCK_TIMEOUT_MS;
  while (true) {
    try {
      fs.closeSync(fs.openSync(LOCK_FILE_PATH, 'wx'));
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
      // Remove a lock left behind by a crashed process
      try {
        if (Date.now() - fs.statSync(LOCK_FILE_PATH).mtimeMs > LOCK_STALE_MS) {
          fs.rmSync(LOCK_FILE_PATH, { force: true });
          continue;
        }
      } catch (e) {
        // Lock was released between checks; retry
      }
      if (Date.now() > deadline) {
        throw new Error(`Timed out waiting for state lock '${LOCK_FILE_PATH}'.`);
      }
      sleepSync(25);
    }
  }

  lockHeld = true;
  try {
    return fn();
  } finally {
    lockHeld = false;
    fs.rmSync(LOCK_FILE_PATH, { force: true });
  }
}

export function readState(): Worktree[] {
  return withStateLock(readStateUnlocked);
}

function readStateUnlocked(): Worktree[] {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) {
      return [];
    }
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    const worktrees = JSON.parse(content) as Worktree[];
    
    let stateChanged = false;
    
    // Runtime sync validation
    const validatedWorktrees = worktrees
      .filter(wt => {
        // Validate directory existence
        if (!fs.existsSync(wt.path)) {
          logger.info(`Pruned missing worktree '${wt.name}' from state (directory not found).`);
          stateChanged = true;
          return false;
        }
        
        // Validate workspace (e.g. Tmux session/window)
        if (wt.workspace) {
          try {
            const provider = getProviderByName(wt.workspace.provider);
            if (provider.isValidSession && !provider.isValidSession(wt.workspace.metadata)) {
              logger.info(`Cleared stale workspace session for worktree '${wt.name}'.`);
              delete wt.workspace;
              stateChanged = true;
            }
          } catch (e) {
            // Ignore error if provider is not resolved
          }
        }
        
        return true;
      });

    if (stateChanged) {
      writeState(validatedWorktrees);
    }

    return validatedWorktrees;
  } catch (error) {
    logger.error(`Error reading state file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
}

export function writeState(worktrees: Worktree[]): void {
  try {
    const configDir = path.dirname(STATE_FILE_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const content = JSON.stringify(worktrees, null, 2);
    fs.writeFileSync(STATE_FILE_PATH, content, 'utf-8');
  } catch (error) {
    logger.error(`Error writing state file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function addWorktree(worktree: Worktree): void {
  withStateLock(() => {
    const currentState = readState();
    if (currentState.some(wt => wt.name === worktree.name)) {
      logger.error(`Worktree with name '${worktree.name}' already exists.`);
      return;
    }
    const newState = [...currentState, worktree];
    writeState(newState);
  });
}

export function removeWorktree(name: string): void {
  withStateLock(() => {
    const currentState = readState();
    const newState = currentState.filter(wt => wt.name !== name);
    if (newState.length === currentState.length) {
      logger.info(`Worktree with name '${name}' not found.`);
    }
    writeState(newState);
  });
}
