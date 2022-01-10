import { TypeOrmExtMetadataItemInterface } from './interfaces/typeorm-ext-metadata-item.interface';
import { TypeOrmExtMetadataItemsInterface } from './interfaces/typeorm-ext-metadata-items.interface';
import { TypeOrmExtMetadataInterface } from './interfaces/typeorm-ext-metadata.interface';
import { TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME } from './typeorm-ext.constants';
import {
  TypeOrmExtConnectionToken,
  TypeOrmExtStorableEntity,
  TypeOrmExtStorableRepository,
  TypeOrmExtStorableSubscriber,
} from './typeorm-ext.types';

class ConfigurationMap<T = unknown> extends Map<
  string,
  TypeOrmExtMetadataItemInterface<T>
> {}

export class TypeOrmExtStorage {
  private static readonly entities =
    new ConfigurationMap<TypeOrmExtStorableEntity>();

  private static readonly repositories =
    new ConfigurationMap<TypeOrmExtStorableRepository>();

  private static readonly subscribers =
    new ConfigurationMap<TypeOrmExtStorableSubscriber>();

  static addConfig(
    config?: TypeOrmExtMetadataInterface,
    defaultConfig?: TypeOrmExtMetadataInterface,
  ) {
    // defaults to set first?
    if (defaultConfig) {
      // yes, recurse
      this.addConfig(defaultConfig);
    }
    // set entities
    if (config?.entities) {
      this.mergeStorage(config.entities, this.entities);
    }
    // set repos
    if (config?.repositories) {
      this.mergeStorage(config.repositories, this.repositories);
    }
  }

  private static resolveConnectionToken(
    connection: TypeOrmExtConnectionToken,
  ): string {
    return !connection
      ? TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME
      : typeof connection === 'string'
      ? connection
      : connection.name;
  }

  private static mergeStorage(
    storageItems: TypeOrmExtMetadataItemsInterface,
    target: ConfigurationMap,
  ) {
    // loop all keys
    for (const storageItemKey of Object.keys(storageItems)) {
      // the storage item
      const storageItem = storageItems[storageItemKey];

      // resolve the connection
      storageItem.connection = this.resolveConnectionToken(
        storageItem?.connection,
      );

      target.set(storageItemKey, storageItem);
    }
  }

  static getEntityByKey(
    key: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableEntity> {
    return this.entities.get(key);
  }

  static getRepositoryByKey(
    key: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableRepository> {
    return this.repositories.get(key);
  }

  static getEntitiesByConnection(
    connection: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableEntity>[] {
    const entities = [];

    this.entities.forEach((entity) => {
      if (entity.connection === connection) {
        entities.push(entity);
      }
    });

    return entities;
  }

  static getSubscribersByConnection(
    connection: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableSubscriber>[] {
    const subscribers = [];

    this.subscribers.forEach((subscriber) => {
      if (subscriber.connection === connection) {
        subscribers.push(subscriber);
      }
    });

    return subscribers;
  }
}
