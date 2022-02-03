import { TypeOrmExtMetadataItemInterface } from './typeorm-ext-metadata-item.interface';

/**
 * Metadata Items Interface
 */
export interface TypeOrmExtMetadataItemsInterface<T = unknown> {
  /**
   * Metadata Items Keys
   */
  [key: string]: TypeOrmExtMetadataItemInterface<T>;
}
