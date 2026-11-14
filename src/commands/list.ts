import { CommandModule } from "yargs";
import { logger } from "../logger";
import { readState } from "../state";
import { getProviderByName } from "../plugins";
import { Worktree } from "../types";

export const command = 'list';
export const describe = 'List all managed git worktrees';
export const aliases = ['l'];

interface ListCommandArgs {
  long?: boolean;
}


export const builder: CommandModule<{}, ListCommandArgs>['builder'] = (yargs) => {
  return yargs
    .option('long', {
      alias: 'l',
      describe: 'List worktrees in detailed table format',
      type: 'boolean',
      default: false,
    })
}

export const handler: CommandModule<{}, ListCommandArgs>['handler'] = async (argv) => {
  const { long: verbose } = argv;

  try {
    logger.info('Listing worktrees...\n');

    // 1. Find the worktree in our state
    const worktrees = readState()

    // 2. List worktrees if any
    if (worktrees.length == 0) {
      logger.log("No worktrees are currently being managed.\n")
      logger.info("Try `wtmg new <my-feature>` to create one.")
      return;
    } else {
      logger.success(`Managed worktrees (${worktrees.length})`);

      if (verbose) printWorktreesVerbose(worktrees)
      else printWorktreesConcise(worktrees) 
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occured.';
    logger.error(`❌ Failed to list worktrees: ${msg}.`);
  }
};


function printWorktreesConcise(wts: Worktree[]): void {
  logger.log(wts.map(wt => `  • ${wt.name}`).join('\n'))
}

function printWorktreesVerbose(worktrees: Worktree[]): void {
  const formattedWorktrees = worktrees.map(wt => {
    let workspace_details = 'N/A';
    if (wt.workspace) {
      const provider = getProviderByName(wt.workspace.provider);
      if (provider.getDisplayDetails) {
        workspace_details = provider.getDisplayDetails(wt.workspace.metadata);
      } else {
        workspace_details = JSON.stringify(wt.workspace.metadata);
      }
    }

    return {
      name: wt.name,
      path: wt.path,
      workspace: workspace_details,
    };
  });

console.table(formattedWorktrees)
}
