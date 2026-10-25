
import { CommandModule } from 'yargs';
import { readState } from '../state';
import { logger } from '../logger';
import clipboard from 'clipboardy';

export const command = 'copy <name>';
export const describe = 'Copy directory to a managed git worktree.';
export const aliases = ['cp'];


interface SwitchCommandArgs {
  name: string;
}

export const builder: CommandModule<{}, SwitchCommandArgs>['builder'] = (yargs) => {
  return yargs
    .positional('name', {
      describe: 'The name of the worktree to remove',
      type: 'string',
      demandOption: true,
    })
};

export const handler: CommandModule<{}, SwitchCommandArgs >['handler'] = async (argv) => {
  const { name: worktreeName } = argv;

  try {
    logger.info(`Copying worktree path: ${worktreeName}`);

    // 1. Find the worktree in our state
    const worktrees = readState();
    const targetWorktree = worktrees.find(wt => wt.name === worktreeName);

    if (!targetWorktree) {
      logger.error(`❌ Worktree '${worktreeName}' not found in managed state.`);
      logger.info('Run `wtmg list` to see managed worktrees.');
      return;
    }


    // 3. Run switch command
    await clipboard.write(`cd "${targetWorktree.path}"`);

    logger.success(`📋 Path copied to clipboard`);

  } catch(e) {

    logger.error(`❌ Failed to switch to worktree '${worktreeName}'.`);
    logger.error(`Error: ${e}`);
  }
}

