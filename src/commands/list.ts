// list all  git worktree sessions
import { CommandModule } from "yargs";
import { logger } from "../logger";
import { readState } from "../state";
// import { logger } from "../logger";
// 
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
      logger.info("Try `wt-mgr new <my-feature>` to create one.")
      return;
    } else {
      logger.success('Managed  worktrees:')
      const formattedWorktrees = worktrees.map(wt => {
        if (wt.tmux) {
          return {
            name: wt.name,
            path: wt.path,
            tmux_session: wt.tmux.session,
            tmux_window_id: wt.tmux.windowId,
          };
        }
        // Backwards compatibility for old state format
        return {
          name: wt.name,
          path: wt.path,
          tmux_session: (wt as any).tmuxSession || 'N/A',
          tmux_window_id: 'N/A',
        };
      });
      console.table(formattedWorktrees)
    }

  } catch (error) {
    const msg = error instanceof Error ? error.message : 'An unknown error occured.';
    logger.error(`❌ Failed to list worktrees: ${msg}.`);
  }
};

