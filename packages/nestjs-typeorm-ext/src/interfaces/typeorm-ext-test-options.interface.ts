import { OptionsInterface } from '@concepta/nestjs-common';

/**
 * Module Test Options Interface
 */
export interface TypeOrmExtTestOptionsInterface extends OptionsInterface {
  /**
   * Settings
   */
  testMode?: boolean;
}
