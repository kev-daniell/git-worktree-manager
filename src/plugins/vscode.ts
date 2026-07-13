import { WorkspaceProvider } from './plugin';
import { runCommand } from '../shell';
import { logger } from '../logger';

export class VSCodeProvider implements WorkspaceProvider {
  name = 'vscode';

  async onCreate(name: string, path: string): Promise<any> {
    try {
      logger.log(`   - Opening VS Code window for: ${path}`);
      // Open the worktree path in VS Code.
      await runCommand(`code ${path}`);
    } catch (error) {
      logger.error(`   - Failed to launch VS Code. Make sure you have the 'code' command installed in your PATH (Shell Command: Install 'code' command in PATH).`);
    }
    return { path };
  }

  async onDelete(name: string, path: string, metadata: any): Promise<void> {
    // VS Code doesn't support closing specific windows via its CLI, so we just inform the user.
    logger.info(`   - VS Code window for '${name}' can be closed manually.`);
  }

  getDisplayDetails(metadata: any): string {
    return 'VS Code';
  }
}
