import fs from 'fs';
import path from 'path';
import os from 'os';
import { HookEvent, HookConfig } from './types';
import { readSettings, APP_NAME } from '../config';

const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.config', APP_NAME);

export function getProjectHooksDir(projectRoot: string): string {
  return path.join(projectRoot, `.${APP_NAME}`, 'hooks');
}

export function getGlobalHooksDir(): string {
  return path.join(GLOBAL_CONFIG_DIR, 'hooks');
}

export function discoverHooks(event: HookEvent, projectRoot: string): HookConfig[] {
  const hooks: HookConfig[] = [];

  // 1. Global config hooks
  const globalSettings = readSettings();
  if (globalSettings.hooks && globalSettings.hooks[event]) {
    hooks.push({
      event,
      command: globalSettings.hooks[event],
      source: 'global'
    });
  }

  // 2. Global executable hooks
  const globalHookScript = path.join(getGlobalHooksDir(), event);
  if (fs.existsSync(globalHookScript)) {
    hooks.push({
      event,
      scriptPath: globalHookScript,
      source: 'global'
    });
  }

  // 3. Project config hooks (.wtmgrc.json)
  const projectConfigPath = path.join(projectRoot, `.${APP_NAME}rc.json`);
  if (fs.existsSync(projectConfigPath)) {
    try {
      const projectConfigContent = fs.readFileSync(projectConfigPath, 'utf-8');
      const projectConfig = JSON.parse(projectConfigContent);
      if (projectConfig.hooks && projectConfig.hooks[event]) {
        hooks.push({
          event,
          command: projectConfig.hooks[event],
          source: 'project'
        });
      }
    } catch (e) {
      // Ignore parse errors for project config
    }
  }

  // 4. Project executable hooks
  const projectHookScript = path.join(getProjectHooksDir(projectRoot), event);
  if (fs.existsSync(projectHookScript)) {
    hooks.push({
      event,
      scriptPath: projectHookScript,
      source: 'project'
    });
  }

  return hooks;
}
