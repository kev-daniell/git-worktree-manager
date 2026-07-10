import { exec } from 'child_process';
import { logger } from './logger';

export function runCommand(
  command: string,
  options: { cwd?: string } = {}
): Promise<string> {
  logger.info(`$ ${command}`);

  return new Promise((resolve, reject) => {
    exec(command, { cwd: options.cwd }, (error, stdout, stderr) => {
      if (error) {
        logger.error(`Error executing command: ${error.message}`);
        if (stderr) {
          logger.error(stderr);
        }
        return reject(error);
      }
      if (stderr) {
        logger.info(`Stderr: ${stderr}`);
      }
      resolve(stdout.trim());
    });
  });
}