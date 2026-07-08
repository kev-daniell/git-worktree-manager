#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { bgBlue, bold } from 'picocolors';
import * as commands from '../src/commands';

const yargsInstance = yargs(hideBin(process.argv));

yargsInstance
  .scriptName('wt-mgr')
  .usage(bgBlue('Welcome to git-worktree-mgr'))
  .command(commands.newCmd)
  .command(commands.listCmd)
  .command(commands.deleteCmd)
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version').argv;
