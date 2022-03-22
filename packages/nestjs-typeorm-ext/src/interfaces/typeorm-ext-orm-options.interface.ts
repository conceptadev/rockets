import { OptionsInterface } from '@concepta/nestjs-common';
import { TypeOrmExtMetadataInterface } from './typeorm-ext-metadata.interface';

/**
 * Module Options Interface
 */
export interface TypeOrmExtOrmOptionsInterface extends OptionsInterface {
  /**
   * ORM Metadata
   */
  orm?: TypeOrmExtMetadataInterface;
}
