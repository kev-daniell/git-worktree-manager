import fs from 'fs';
import path from 'path';
import { Worktree } from './types';
import { STATE_FILE_PATH } from './config';
import { logger } from './logger';
import { getProviderByName } from './plugins';

export function readState(): Worktree[] {
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
  const currentState = readState();
  if (currentState.some(wt => wt.name === worktree.name)) {
    logger.error(`Worktree with name '${worktree.name}' already exists.`);
    return;
  }
  const newState = [...currentState, worktree];
  writeState(newState);
}

export function removeWorktree(name: string): void {
  const currentState = readState();
  const newState = currentState.filter(wt => wt.name !== name);
  if (newState.length === currentState.length) {
    logger.info(`Worktree with name '${name}' not found.`);
  }
  writeState(newState);
}
