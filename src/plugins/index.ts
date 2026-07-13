import { WorkspaceProvider } from './plugin';
import { TmuxProvider } from './tmux';
import { NoneProvider } from './none';
import { readSettings } from '../config';

export function getActiveProvider(): WorkspaceProvider {
  const settings = readSettings();

  return getProviderByName(settings.provider);
}

export function getProviderByName(name: string): WorkspaceProvider {
  switch (name.toLowerCase()) {
    case 'tmux':
      return new TmuxProvider();
    case 'none':
      return new NoneProvider();
    default:
      // Fallback to none if an unknown provider is specified
      return new NoneProvider();
  }
}

export type { WorkspaceProvider };
