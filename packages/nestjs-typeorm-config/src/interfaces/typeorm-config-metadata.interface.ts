import { OptionsInterface } from '@rockts-org/nestjs-common';
import {
  TypeOrmConfigConnectionToken,
  TypeOrmConfigStorableEntity,
  TypeOrmConfigStorableRepo,
  TypeOrmConfigStorableSubscriber,
} from '../typeorm-config.types';

export interface TypeOrmConfigMetaDataStorageItemInterface<T = unknown>
  extends OptionsInterface {
  useClass?: T;
  connection?: TypeOrmConfigConnectionToken;
}

export interface TypeOrmConfigMetaDataStorageInterface<T = unknown> {
  [key: string]: TypeOrmConfigMetaDataStorageItemInterface<T>;
}

export interface TypeOrmConfigMetaDataInterface extends OptionsInterface {
  entities?: TypeOrmConfigMetaDataStorageInterface<TypeOrmConfigStorableEntity>;
  repositories?: TypeOrmConfigMetaDataStorageInterface<TypeOrmConfigStorableRepo>;
  subscribers?: TypeOrmConfigMetaDataStorageInterface<TypeOrmConfigStorableSubscriber>;
}
