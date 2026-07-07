#!/usr/bin/env node
import yargs, { CommandModule } from 'yargs'
import * as _ from 'dotenv'
import { bgBlue } from 'picocolors'
import { commands } from '../src/commands'

const run = yargs(process.argv.slice(2))
run.usage(
  bgBlue(
    `Welcome to envdrift`,
  ),
)
for (const command of commands) {
  run.command(command as CommandModule)
}

run.demandCommand(1, 'You need at least one command before moving on').help().argv
