import { logger } from './logger';

export type RollbackAction = () => Promise<void> | void;

export class RollbackStack {
  private actions: { name: string; action: RollbackAction }[] = [];
  private isRollingBack = false;
  private interruptHandler: () => void;

  constructor() {
    this.interruptHandler = async () => {
      logger.info('\nProcess interrupted.');
      await this.rollback();
      process.exit(1);
    };
    process.on('SIGINT', this.interruptHandler);
    process.on('SIGTERM', this.interruptHandler);
  }

  add(name: string, action: RollbackAction) {
    this.actions.push({ name, action });
  }

  async rollback() {
    if (this.isRollingBack || this.actions.length === 0) return;
    this.isRollingBack = true;

    logger.info('Rolling back changes due to failure/interrupt...');
    
    // Execute actions in reverse order (LIFO)
    for (let i = this.actions.length - 1; i >= 0; i--) {
      const { name, action } = this.actions[i];
      try {
        logger.info(`  -> Reverting: ${name}`);
        await action();
      } catch (error: any) {
        logger.error(`  -> Failed to revert '${name}': ${error?.message || error}`);
      }
    }
    this.actions = [];
    this.isRollingBack = false;
  }

  cleanup() {
    process.off('SIGINT', this.interruptHandler);
    process.off('SIGTERM', this.interruptHandler);
  }
}
