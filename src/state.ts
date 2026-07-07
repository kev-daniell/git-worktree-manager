import { Worktree } from './types';

const STATE_FILE_PATH = '~/.config/wt-mgr/state.json'; // We'll handle path expansion later

/**
 * Reads the current state from the state file.
 * @returns An array of worktree objects.
 */
export function readState(): Worktree[] {
  console.log('// TODO: Read state from', STATE_FILE_PATH);
  // In the future, this will read and parse the JSON file.
  return [];
}

/**
 * Writes the given state to the state file.
 * @param worktrees - The array of worktree objects to save.
 */
export function writeState(worktrees: Worktree[]): void {
  console.log('// TODO: Write state to', STATE_FILE_PATH);
  // In the future, this will serialize the array to JSON and write it.
}

/**
 * Adds a new worktree to the state.
 * @param worktree - The worktree object to add.
 */
export function addWorktree(worktree: Worktree): void {
  const currentState = readState();
  const newState = [...currentState, worktree];
  writeState(newState);
  console.log(`// TODO: Logic to add ${worktree.name} to state`);
}

/**
 * Removes a worktree from the state by its name.
 * @param name - The name of the worktree to remove.
 */
export function removeWorktree(name: string): void {
  const currentState = readState();
  const newState = currentState.filter(wt => wt.name !== name);
  writeState(newState);
  console.log(`// TODO: Logic to remove ${name} from state`);
}
