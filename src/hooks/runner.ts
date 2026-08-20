import { exec } from 'child_process';
import { promisify } from 'util';
import { HookContext, HookConfig } from './types';
import { discoverHooks } from './discovery';
import { logger } from '../logger';

const execAsync = promisify(exec);

export async function runHook(config: HookConfig, context: HookContext): Promise<void> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    WTMG_HOOK_EVENT: context.eventName,
    WTMG_WORKTREE_NAME: context.worktreeName,
    WTMG_WORKTREE_PATH: context.worktreePath,
    WTMG_PROJECT_ROOT: context.projectRoot,
    WTMG_BASE_BRANCH: context.baseBranch || '',
    WTMG_WORKSPACE_PROVIDER: context.workspaceProvider || 'none',
  };

  let commandToRun = '';

  if (config.scriptPath) {
    commandToRun = `"${config.scriptPath}"`;
  } else if (config.command) {
    commandToRun = config.command;
  } else {
    return;
  }

  logger.info(`Running ${config.source} ${context.eventName} hook...`);
  
  try {
    const { stdout, stderr } = await execAsync(commandToRun, { 
      env,
      cwd: context.worktreePath || context.projectRoot,
    });
    
    if (stdout && stdout.trim().length > 0) {
      logger.log(stdout.trim().split('\n').map(line => `  [hook] ${line}`).join('\n'));
    }
    if (stderr && stderr.trim().length > 0) {
      logger.error(stderr.trim().split('\n').map(line => `  [hook] ${line}`).join('\n'));
    }
  } catch (error: any) {
    if (error.stdout && error.stdout.trim().length > 0) {
      logger.log(error.stdout.trim().split('\n').map((line: string) => `  [hook] ${line}`).join('\n'));
    }
    if (error.stderr && error.stderr.trim().length > 0) {
      logger.error(error.stderr.trim().split('\n').map((line: string) => `  [hook] ${line}`).join('\n'));
    }
    throw new Error(`Hook execution failed for ${context.eventName} (${config.source})`);
  }
}

export async function runHooksForEvent(context: HookContext): Promise<void> {
  const hooks = discoverHooks(context.eventName, context.projectRoot);
  
  if (hooks.length === 0) {
    return;
  }

  for (const hook of hooks) {
    try {
      await runHook(hook, context);
    } catch (error: any) {
      if (context.eventName.startsWith('pre-')) {
        // pre- hooks abort the operation
        logger.error(`❌ ${error.message}`);
        throw error;
      } else {
        // post- hooks just log a warning
        logger.error(`⚠️ ${error.message}. Continuing...`);
      }
    }
  }
}
