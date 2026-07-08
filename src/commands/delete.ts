import type { CommandModule } from 'yargs';
import { readState, removeWorktree } from '../state';
import { logger } from '../logger';
import { runCommand } from '../shell';

export const command = 'delete <name>';
export const describe = 'Remove a managed git worktree.';
export const aliases = ['d', 'rm'];

interface DeleteCommandArgs {
  name: string;
}

export const builder: CommandModule<{}, DeleteCommandArgs>['builder'] = (yargs) => {
  return yargs.positional('name', {
    describe: 'The name of the worktree to remove',
    type: 'string',
    demandOption: true,
  });
};

export const handler: CommandModule<{}, DeleteCommandArgs>['handler'] = async (argv) => {
  const { name } = argv;

  try {
    logger.info(`Deleting worktree '${name}'...`);

    // 1. Find the worktree in our state
    const worktrees = readState();
    const worktreeToDelete = worktrees.find(wt => wt.name === name);

    if (!worktreeToDelete) {
      logger.error(`❌ Worktree '${name}' not found in managed state.`);
      logger.info('Run `wt-mgr list` to see managed worktrees.');
      return;
    }

    // 2. Run the git worktree remove command
    // Per the request, we do not use --force, leaving the branch.
    await runCommand(`git worktree remove ${worktreeToDelete.path}`);

    // 3. Remove the worktree from our state
    removeWorktree(name);

    logger.success(`✅ Successfully removed worktree '${name}'.`);
    logger.info(`   - The branch '${name}' was not deleted.`);
    logger.info(`   - The tmux window/session was not affected.`);

  } catch (error) {
    logger.error(`❌ Failed to delete worktree '${name}'.`);
    logger.error('This can happen if the worktree has unstaged changes.');
    logger.error('You may need to resolve the git error and then run `wt-mgr state:sync` (feature to be implemented).');
  }
};