import { WorkspaceProvider } from './plugin';
import { logger } from '../logger';

export class NoneProvider implements WorkspaceProvider {
  name = 'none';

  async onCreate(name: string, path: string): Promise<any> {
    // We don't integrate with any multiplexer.
    // Return empty metadata.
    return {};
  }

  async onDelete(name: string, path: string, metadata: any): Promise<void> {
    // Nothing to clean up
  }

  getDisplayDetails(metadata: any): string {
    return 'None';
  }
}
