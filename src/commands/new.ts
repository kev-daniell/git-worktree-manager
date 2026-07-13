import { CommandModule } from 'yargs';
import path from 'path';
import { addWorktree } from '../state';
import { logger } from '../logger';
import { runCommand } from '../shell';
import { getActiveProvider } from '../plugins';

export const command = 'new <name> [base-branch]';
export const describe = 'Create a new worktree, branch, and workspace session.';
export const aliases = ['n'];

interface NewCommandArgs {
  name: string;
  'base-branch'?: string;
  w?: boolean;
}

export const builder: CommandModule<{}, NewCommandArgs>['builder'] = (yargs) => {
  return yargs
    .positional('name', {
      describe: 'The name for the worktree, new branch, and workspace session',
      type: 'string',
      demandOption: true,
    })
    .positional('base-branch', {
      describe: 'The git branch to base the new worktree on',
      type: 'string',
    })
    .option('w', {
      alias: 'workspace',
      describe: 'Create an associated workspace session or window.',
      type: 'boolean',
      default: false,
    });
};

export const handler: CommandModule<{}, NewCommandArgs>['handler'] = async (argv) => {
  const { name, 'base-branch': baseBranch, w } = argv;

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

    // 4. Set up the workspace session if requested
    let workspaceState: { provider: string; metadata: any } | undefined;

    if (w) {
      const provider = getActiveProvider();
      const metadata = await provider.onCreate(name, worktreePath);
      workspaceState = {
        provider: provider.name,
        metadata
      };
    }

    // 5. Save the new worktree's state
    addWorktree({
      name,
      path: worktreePath,
      ...(workspaceState ? { workspace: workspaceState } : {}),
    });

    logger.success(`✅ Successfully created worktree '${name}'.`);
    logger.log(`   - Path: ${worktreePath}`);

  } catch (error) {
    logger.error(`❌ Failed to create worktree '${name}'. Please check the output above for details.`);
  }
};