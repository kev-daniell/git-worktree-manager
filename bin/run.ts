#!/usr/bin/env bun
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { bgBlue } from 'picocolors';
import * as newCmd from '../src/commands/new';
import * as listCmd from '../src/commands/list';
import * as deleteCmd from '../src/commands/delete';
import * as setWorkspaceCmd from '../src/commands/setWorkspace';
import * as switchCmd from '../src/commands/switch';

const yargsInstance = yargs(hideBin(process.argv));

yargsInstance
  .scriptName('wtmg')
  .usage(bgBlue('Welcome to git-worktree-mgr'))
  .command(newCmd)
  .command(listCmd)
  .command(deleteCmd)
  .command(setWorkspaceCmd)
  .command(switchCmd)
  .demandCommand(1, 'You need at least one command before moving on')
  .strict()
  .help()
  .alias('h', 'help')
  .alias('v', 'version').argv;
