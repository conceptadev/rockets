import {
  TypeOrmConfigMetaDataInterface,
  TypeOrmConfigMetaDataStorageInterface,
  TypeOrmConfigMetaDataStorageItemInterface,
} from './interfaces/typeorm-config-metadata.interface';
import { TYPEORM_CONFIG_MODULE_DEFAULT_CONNECTION_NAME } from './typeorm-config.constants';
import {
  TypeOrmConfigConnectionToken,
  TypeOrmConfigStorableEntity,
  TypeOrmConfigStorableRepo,
  TypeOrmConfigStorableSubscriber,
} from './typeorm-config.types';

class ConfigurationMap<T = unknown> extends Map<
  string,
  TypeOrmConfigMetaDataStorageItemInterface<T>
> {}

export class TypeOrmConfigStorage {
  private static readonly entities =
    new ConfigurationMap<TypeOrmConfigStorableEntity>();

  private static readonly repositories =
    new ConfigurationMap<TypeOrmConfigStorableRepo>();

  private static readonly subscribers =
    new ConfigurationMap<TypeOrmConfigStorableSubscriber>();

  static addConfig(
    config?: TypeOrmConfigMetaDataInterface,
    defaultConfig?: TypeOrmConfigMetaDataInterface,
  ) {
    // defaults to set first/
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
    connection: TypeOrmConfigConnectionToken,
  ): string {
    return !connection
      ? TYPEORM_CONFIG_MODULE_DEFAULT_CONNECTION_NAME
      : typeof connection === 'string'
      ? connection
      : connection.name;
  }

  private static mergeStorage(
    storageItems: TypeOrmConfigMetaDataStorageInterface,
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
  ): TypeOrmConfigMetaDataStorageItemInterface<TypeOrmConfigStorableEntity> {
    return this.entities.get(key);
  }

  static getRepositoryByKey(
    key: string,
  ): TypeOrmConfigMetaDataStorageItemInterface<TypeOrmConfigStorableRepo> {
    return this.repositories.get(key);
  }

  static getEntitiesByConnection(
    connection: string,
  ): TypeOrmConfigMetaDataStorageItemInterface<TypeOrmConfigStorableEntity>[] {
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
  ): TypeOrmConfigMetaDataStorageItemInterface<TypeOrmConfigStorableSubscriber>[] {
    const subscribers = [];

    this.subscribers.forEach((subscriber) => {
      if (subscriber.connection === connection) {
        subscribers.push(subscriber);
      }
    });

    return subscribers;
  }
}
