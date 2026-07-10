import { CommandModule } from 'yargs';
import path from 'path';
import { addWorktree } from '../state';
import { logger } from '../logger';
import { runCommand } from '../shell';

export const command = 'new <name> [base-branch]';
export const describe = 'Create a new worktree, branch, and tmux session.';
export const aliases = ['n'];

interface NewCommandArgs {
  name: string;
  'base-branch'?: string;
  t?: boolean;
}

export const builder: CommandModule<{}, NewCommandArgs>['builder'] = (yargs) => {
  return yargs
    .positional('name', {
      describe: 'The name for the worktree, new branch, and tmux session',
      type: 'string',
      demandOption: true,
    })
    .positional('base-branch', {
      describe: 'The git branch to base the new worktree on',
      type: 'string',
    })
    .option('t', {
      alias: 'tmux',
      describe: 'Create an associated tmux window or session.',
      type: 'boolean',
      default: false,
    });
};

export const handler: CommandModule<{}, NewCommandArgs>['handler'] = async (argv) => {
  const { name, 'base-branch': baseBranch, t } = argv;

  try {
    logger.info(`Creating new worktree '${name}'...`);

    // 1. Get the root directory of the current git repository
    const gitRoot = await runCommand('git rev-parse --show-toplevel');
    const projectDirName = path.basename(gitRoot);

    // 2. Define a path for the new worktree adjacent to the project directory
    const worktreePath = path.resolve(gitRoot, '..', `${projectDirName}-${name}`);

    // 3. Create the new branch and worktree
    const branch = baseBranch || (await runCommand('git rev-parse --abbrev-ref HEAD'));
    await runCommand(`git worktree add -b ${name} ${worktreePath} ${branch}`);

    // 4. Create a new tmux window or session if requested
    let tmuxConfig: { session: string; windowId: number } | undefined;

    if (t) {
      const inTmux = !!process.env.TMUX;
      let sessionName: string;
      let windowId: number;

      if (inTmux) {
        // We are in a tmux session, create a new window and switch to it
        const newWindowIdStr = await runCommand(`tmux new-window -c ${worktreePath} -n ${name} -P -F '#{window_id}'`);
        windowId = parseInt(newWindowIdStr.trim().substring(1), 10);
        sessionName = await runCommand(`tmux display-message -p -F '#S'`);
      } else {
        // We are not in a tmux session, create a new detached session
        sessionName = name;
        await runCommand(`tmux new-session -d -s ${sessionName} -c ${worktreePath}`);
        const newWindowIdStr = await runCommand(`tmux list-windows -t ${sessionName} -F '#{window_id}' | head -n 1`);
        windowId = parseInt(newWindowIdStr.trim().substring(1), 10);
      }

      tmuxConfig = {
        session: sessionName,
        windowId,
      };
    }

    // 5. Save the new worktree's state
    addWorktree({
      name,
      path: worktreePath,
      ...(tmuxConfig ? { tmux: tmuxConfig } : {}),
    });

    logger.success(`✅ Successfully created worktree '${name}'.`);
    logger.log(`   - Path: ${worktreePath}`);
    if (t) {
      const inTmux = !!process.env.TMUX;
      if (inTmux) {
        logger.log(`   - Switched to new window '[${name}]' in current session.`);
      } else {
        logger.log(`   - To attach, run: tmux attach -t ${name}`);
      }
    }

  } catch (error) {
    logger.error(`❌ Failed to create worktree '${name}'. Please check the output above for details.`);
  }
};