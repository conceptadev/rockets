import { TypeOrmExtMetadataItemInterface } from './typeorm-ext-metadata-item.interface';

export interface TypeOrmExtMetadataItemsInterface<T = unknown> {
  [key: string]: TypeOrmExtMetadataItemInterface<T>;
}
