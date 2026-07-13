import { WorkspaceProvider } from './plugin';
import { runCommand } from '../shell';
import { logger } from '../logger';

export class TmuxProvider implements WorkspaceProvider {
  name = 'tmux';

  async onCreate(name: string, path: string): Promise<any> {
    const inTmux = !!process.env.TMUX;
    let sessionName: string;
    let windowId: number;

    if (inTmux) {
      // We are in a tmux session, create a new window and switch to it
      const newWindowIdStr = await runCommand(`tmux new-window -c ${path} -n ${name} -P -F '#{window_id}'`);
      windowId = parseInt(newWindowIdStr.trim().substring(1), 10);
      sessionName = await runCommand(`tmux display-message -p -F '#S'`);
      logger.log(`   - Switched to new window '[${name}]' in current session.`);
    } else {
      // We are not in a tmux session, create a new detached session
      sessionName = name;
      await runCommand(`tmux new-session -d -s ${sessionName} -c ${path}`);
      const newWindowIdStr = await runCommand(`tmux list-windows -t ${sessionName} -F '#{window_id}' | head -n 1`);
      windowId = parseInt(newWindowIdStr.trim().substring(1), 10);
      logger.log(`   - To attach, run: tmux attach -t ${name}`);
    }

    return {
      session: sessionName,
      windowId: windowId,
    };
  }

  async onDelete(name: string, path: string, metadata: any): Promise<void> {
    if (!metadata || metadata.session === undefined || metadata.windowId === undefined) {
      logger.info(`   - No tmux information found in state for this worktree.`);
      return;
    }

    try {
      const target = `${metadata.session}:@${metadata.windowId}`;
      await runCommand(`tmux kill-window -t ${target}`);
      logger.info(`   - Closed tmux window @${metadata.windowId} in session '${metadata.session}'.`);
    } catch (error) {
      logger.info(`   - Could not close tmux window. It may have been closed already.`);
    }
  }

  getDisplayDetails(metadata: any): string {
    if (metadata && metadata.session && metadata.windowId !== undefined) {
      return `Session: ${metadata.session}, Window: @${metadata.windowId}`;
    }
    return 'N/A';
  }
}
