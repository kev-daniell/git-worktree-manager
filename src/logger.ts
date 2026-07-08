import { blue, red, green, bold } from 'picocolors';

export const logger = {
  log: (message: string) => {
    console.log(message);
  },
  info: (message: string) => {
    console.log(blue(message));
  },
  success: (message: string) => {
    console.log(green(bold(message)));
  },
  error: (message: string) => {
    console.error(red(message));
  },
};