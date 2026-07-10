import path from 'path';
import os from 'os';

export const APP_NAME = 'wtmg';

/**
 * The directory where the application stores its state.
 * Follows the XDG Base Directory Specification for config files.
 * (~/.config/wtmg)
 */
const CONFIG_DIR = path.join(os.homedir(), '.config', APP_NAME);

/**
 * The full path to the JSON file where worktree state is stored.
 */
export const STATE_FILE_PATH = path.join(CONFIG_DIR, 'state.json');
