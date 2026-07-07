// deletes git worktree sessions
import { CommandModule } from "yargs";
// import { logger } from "../logger";

export const command = 'delete';
export const describe = '';
export const aliases = ['d'];


interface DeleteCommandArgs {
  wtName: string | undefined;
}


export const builder: CommandModule<{}, DeleteCommandArgs>['builder'] = (yargs) => {
  return yargs
    .option('wtName', {
      type: 'string',
      description: '',
      alias: 'n',
    })
};

export const handler: CommandModule<{}, DeleteCommandArgs>['handler'] = async (argv) => {
  console.log('hi')
};


