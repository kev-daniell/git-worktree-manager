import { CommandModule } from "yargs";
import { logger } from "../logger";
import { readState } from "../state";
import { getProviderByName } from "../plugins";

export const command = 'list';
export const describe = '';
export const aliases = ['l'];



export const handler: CommandModule<{}>['handler'] = async (argv) => {
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
      logger.success('Managed  worktrees:')
      const formattedWorktrees = worktrees.map(wt => {
        let workspace_details = 'N/A';
        if (wt.workspace) {
          const provider = getProviderByName(wt.workspace.provider);
          if (provider.getDisplayDetails) {
            workspace_details = provider.getDisplayDetails(wt.workspace.metadata);
          } else {
            workspace_details = JSON.stringify(wt.workspace.metadata);
          }
        } else if (wt.tmux) {
          // Fallback if legacy tmux field is somehow present
          workspace_details = `Session: ${wt.tmux.session}, Window: @${wt.tmux.windowId}`;
        }

        return {
          name: wt.name,
          path: wt.path,
          workspace: workspace_details,
        };
      });
      console.table(formattedWorktrees)
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occured.';
    logger.error(`❌ Failed to list worktrees: ${msg}.`);
  }
};

