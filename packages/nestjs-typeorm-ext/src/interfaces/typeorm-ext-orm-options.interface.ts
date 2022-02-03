import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmExtMetadataInterface } from './typeorm-ext-metadata.interface';

/**
 * TypeOrmExt Options Interface
 */
export interface TypeOrmExtOrmOptionsInterface extends OptionsInterface {
  /**
   * TypeOrmExt ORM Metadata
   */
  orm?: TypeOrmExtMetadataInterface;
}
