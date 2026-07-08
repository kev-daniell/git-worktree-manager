import path from 'path';
import os from 'os';

export const APP_NAME = 'wt-mgr';

/**
 * The directory where the application stores its state.
 * Follows the XDG Base Directory Specification for config files.
 * (~/.config/wt-mgr)
 */
const CONFIG_DIR = path.join(os.homedir(), '.config', APP_NAME);

/**
 * The full path to the JSON file where worktree state is stored.
 */
export const STATE_FILE_PATH = path.join(CONFIG_DIR, 'state.json');

/**
 * The base path where new worktrees will be created.
 * For example, if the current project is in '/Users/me/project',
 * worktrees will be created in '/Users/me/project-wt/'.
 * TODO: This could be made configurable in the future.
 */
export const WORKTREE_BASE_PATH = path.join(os.homedir(), 'worktrees'); // Placeholder
