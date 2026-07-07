// creates a new  git worktree sessions
import { CommandModule } from "yargs";
// import { logger } from "../logger";


export const command = 'new';
export const describe = '';
export const aliases = ['n'];

interface NewCommandArgs {
  wtName: string;
  branch: string;
}


export const builder: CommandModule<{}, NewCommandArgs>['builder'] = (yargs) => {
  return yargs
    .option('wtName', {
      type: 'string',
      description: '',
      alias: 'n',
      default: "worktree" // TODO: make a dynamic default?
    })
    .option('branch', {
      type: 'string',
      description: 'Include the shell environment in the comparison',
      alias: 'b',
      default: "main",
    });
};

export const handler: CommandModule<{}, NewCommandArgs>['handler'] = async (argv) => {
  console.log('hi')
};

