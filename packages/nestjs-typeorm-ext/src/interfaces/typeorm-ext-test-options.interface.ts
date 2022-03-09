import { OptionsInterface } from '@rockts-org/nestjs-common';

/**
 * Module Test Options Interface
 */
export interface TypeOrmExtTestOptionsInterface extends OptionsInterface {
  /**
   * Settings
   */
  testMode?: boolean;
}
