// list all  git worktree sessions
import { CommandModule } from "yargs";
// import { logger } from "../logger";
// 
export const command = 'list';
export const describe = '';
export const aliases = ['l'];



export const handler: CommandModule<{}>['handler'] = async (argv) => {
  console.log('hi')
};

