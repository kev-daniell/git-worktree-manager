import { CommandModule } from 'yargs';
import { readState, removeWorktree } from '../state';
import { logger } from '../logger';
import { runCommand } from '../shell';
import { getProviderByName } from '../plugins';

export const command = 'delete <name>';
export const describe = 'Remove a managed git worktree.';
export const aliases = ['d', 'rm'];

interface DeleteCommandArgs {
  name: string;
  w?: boolean;
  b?: boolean;
}

export const builder: CommandModule<{}, DeleteCommandArgs>['builder'] = (yargs) => {
  return yargs
    .positional('name', {
      describe: 'The name of the worktree to remove',
      type: 'string',
      demandOption: true,
    })
    .option('w', {
      alias: 'workspace',
      describe: 'Also close the associated workspace window/session.',
      type: 'boolean',
      default: false,
    })
    .option('b', {
      alias: 'branch',
      describe: 'Also delete the associated git branch.',
      type: 'boolean',
      default: false,
    });
};

export const handler: CommandModule<{}, DeleteCommandArgs>['handler'] = async (argv) => {
  const { name, w, b } = argv;

  try {
    logger.info(`Deleting worktree '${name}'...`);

    // 1. Find the worktree in our state
    const worktrees = readState();
    const worktreeToDelete = worktrees.find(wt => wt.name === name);

    if (!worktreeToDelete) {
      logger.error(`❌ Worktree '${name}' not found in managed state.`);
      logger.info('Run `wtmg list` to see managed worktrees.');
      return;
    }

    // 2. Close the associated workspace window, if requested
    if (w) {
      if (worktreeToDelete.workspace) {
        const provider = getProviderByName(worktreeToDelete.workspace.provider);
        await provider.onDelete(name, worktreeToDelete.path, worktreeToDelete.workspace.metadata);
      } else {
        logger.info(`   - No workspace information found for this worktree.`);
      }
    }

    // 3. Run the git worktree remove command
    await runCommand(`git worktree remove ${worktreeToDelete.path}`);

    // 4. Delete the git branch, if requested
    if (b) {
      try {
        await runCommand(`git branch -d ${name}`);
        logger.info(`   - Deleted git branch '${name}'.`);
      } catch (error) {
        logger.error(`   - Failed to delete branch '${name}'. It might have unmerged changes.`);
        logger.info(`   - To force delete, run: git branch -D ${name}`);
      }
    } else {
      logger.info(`   - The branch '${name}' was not deleted.`);
    }

    // 5. Remove the worktree from our state
    removeWorktree(name);

    logger.success(`✅ Successfully removed worktree '${name}'.`);

  } catch (error) {
    logger.error(`❌ Failed to delete worktree '${name}'.`);
    logger.error('This can happen if the worktree has unstaged changes.');
    logger.error('You may need to resolve the git error and then run `wtmg state:sync` (feature to be implemented).');
  }
};