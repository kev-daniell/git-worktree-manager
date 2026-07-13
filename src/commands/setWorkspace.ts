import { CommandModule } from 'yargs';
import { logger } from '../logger';
import { readSettings, writeSettings } from '../config';

export const command = 'set-workspace <provider>';
export const describe = 'Set the default workspace provider (e.g., tmux, none)';
export const aliases = ['sw'];

interface SetWorkspaceArgs {
  provider: string;
}

export const builder: CommandModule<{}, SetWorkspaceArgs>['builder'] = (yargs) => {
  return yargs.positional('provider', {
    describe: 'The workspace provider to use',
    type: 'string',
    choices: ['tmux', 'none', 'vscode'],
    demandOption: true,
  });
};

export const handler: CommandModule<{}, SetWorkspaceArgs>['handler'] = async (argv) => {
  const { provider } = argv;

  try {
    const settings = readSettings();
    settings.provider = provider.toLowerCase();
    
    writeSettings(settings);
    
    logger.success(`✅ Default workspace provider set to '${settings.provider}'.`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`❌ Failed to set workspace provider: ${msg}`);
  }
};
