import type { CommandModule } from 'yargs';
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
    });
};

export const handler: CommandModule<{}, NewCommandArgs>['handler'] = async (argv) => {
  const { name, 'base-branch': baseBranch } = argv;

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

    // 4. Create a new tmux window or session
    const inTmux = !!process.env.TMUX;
    let tmuxTarget = name; // Default to session name

    if (inTmux) {
      // We are in a tmux session, create a new window and switch to it
      await runCommand(`tmux new-window -c ${worktreePath} -n ${name}`);
      // The user is automatically switched, no need to store the window ID for now
      // For deletion, we can target by window name.
    } else {
      // We are not in a tmux session, create a new detached session
      await runCommand(`tmux new-session -d -s ${name} -c ${worktreePath}`);
    }

    // 5. Save the new worktree's state
    addWorktree({
      name,
      path: worktreePath,
      tmuxSession: name, // We'll target by name for both windows and sessions for now
    });

    logger.success(`✅ Successfully created worktree '${name}'.`);
    logger.log(`   - Path: ${worktreePath}`);
    if (inTmux) {
      logger.log(`   - Switched to new window '[${name}]' in current session.`);
    } else {
      logger.log(`   - To attach, run: tmux attach -t ${name}`);
    }

  } catch (error) {
    logger.error(`❌ Failed to create worktree '${name}'. Please check the output above for details.`);
  }
};