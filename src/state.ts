import fs from 'fs';
import path from 'path';
import { Worktree } from './types';
import { STATE_FILE_PATH } from './config';
import { logger } from './logger';

/**
 * Reads the current state from the state file.
 * @returns An array of worktree objects.
 */
export function readState(): Worktree[] {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) {
      return [];
    }
    const content = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
    return JSON.parse(content) as Worktree[];
  } catch (error) {
    logger.error(`Error reading state file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // If the file is corrupted or unreadable, default to an empty state.
    return [];
  }
}

/**
 * Writes the given state to the state file.
 * @param worktrees - The array of worktree objects to save.
 */
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

/**
 * Adds a new worktree to the state.
 * @param worktree - The worktree object to add.
 */
export function addWorktree(worktree: Worktree): void {
  const currentState = readState();
  // Avoid adding duplicates
  if (currentState.some(wt => wt.name === worktree.name)) {
    logger.error(`Worktree with name '${worktree.name}' already exists.`);
    return;
  }
  const newState = [...currentState, worktree];
  writeState(newState);
}

/**
 * Removes a worktree from the state by its name.
 * @param name - The name of the worktree to remove.
 */
export function removeWorktree(name: string): void {
  const currentState = readState();
  const newState = currentState.filter(wt => wt.name !== name);
  if (newState.length === currentState.length) {
    logger.info(`Worktree with name '${name}' not found.`);
  }
  writeState(newState);
}