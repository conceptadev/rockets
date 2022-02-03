import { TypeOrmExtMetadataItemInterface } from './typeorm-ext-metadata-item.interface';

/**
 * TypeOrmExt Metadata Items Interface
 */
export interface TypeOrmExtMetadataItemsInterface<T = unknown> {
  /**
   * TypeOrmExt Metadata Items Keys
   */
  [key: string]: TypeOrmExtMetadataItemInterface<T>;
}
