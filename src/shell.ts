import { exec } from 'child_process';
import { logger } from './logger';

/**
 * A promise-based wrapper for Node.js's `exec`.
 * @param command The shell command to execute.
 * @param options Optional execution options.
 * @returns A promise that resolves with the command's stdout.
 */
export function runCommand(
  command: string,
  options: { cwd?: string } = {}
): Promise<string> {
  logger.info(`$ ${command}`); // Log the command being run

  return new Promise((resolve, reject) => {
    exec(command, { cwd: options.cwd }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error executing command: ${error.message}`);
        // Also log stderr if it's available, as it often contains the useful error info
        if (stderr) {
          logger.error(stderr);
        }
        return reject(error);
      }
      // Some commands output to stderr for non-fatal info, so we log it but don't reject.
      if (stderr) {
        logger.info(`Stderr: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
}