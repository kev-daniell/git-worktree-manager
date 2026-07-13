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

/**
 * The full path to the JSON file where user configuration is stored.
 */
export const SETTINGS_FILE_PATH = path.join(CONFIG_DIR, 'config.json');

export interface AppSettings {
  provider: string;
}

import fs from 'fs';

export function readSettings(): AppSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return JSON.parse(content) as AppSettings;
    }
  } catch (error) {
    // Fail silently and fallback to default
  }

  // Auto-detect TMUX by default
  if (process.env.TMUX) {
    return { provider: 'tmux' };
  }
  return { provider: 'none' };
}

export function writeSettings(settings: AppSettings): void {
  try {
    // Ensure the config directory exists
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2));
  } catch (error) {
    throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
