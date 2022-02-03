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

/**
 * Configuration Mapper
 */
class ConfigurationMap<T = unknown> extends Map<
  string,
  TypeOrmExtMetadataItemInterface<T>
> {}

/**
 * Typeorm storage extension
 */
export class TypeOrmExtStorage {
  /**
   * Entities
   */
  private static readonly entities =
    new ConfigurationMap<TypeOrmExtStorableEntity>();

  /**
   * Repositories
   */
  private static readonly repositories =
    new ConfigurationMap<TypeOrmExtStorableRepository>();

  /**
   * Subscribers
   */
  private static readonly subscribers =
    new ConfigurationMap<TypeOrmExtStorableSubscriber>();

  /**
   * Add configuration
   *
   * @param {TypeOrmExtMetadataInterface} config Configuration
   * @param {TypeOrmExtMetadataInterface} defaultConfig Default Configuration
   */
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

  /**
   * Resolve connection token
   *
   * @param {TypeOrmExtConnectionToken}connection Connection Token
   * @returns {string} Connection String
   */
  private static resolveConnectionToken(
    connection: TypeOrmExtConnectionToken,
  ): string {
    return !connection
      ? TYPEORM_EXT_MODULE_DEFAULT_CONNECTION_NAME
      : typeof connection === 'string'
      ? connection
      : connection.name;
  }

  /**
   * Merge storage
   *
   * @param {TypeOrmExtMetadataItemsInterface}storageItems Storage Items
   * @param {ConfigurationMap} target Storage target
   */
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

  /**
   * Get entities by the key
   *
   * @param {string} key Entity key
   * @returns {TypeOrmExtMetadataItemInterface<TypeOrmExtStorableEntity>} Entity
   */
  static getEntityByKey(
    key: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableEntity> {
    return this.entities.get(key);
  }

  /**
   * Get repositories by the key
   *
   * @param {string}key Repository Key
   * @returns {TypeOrmExtMetadataItemInterface<TypeOrmExtStorableRepository>} Repository
   */
  static getRepositoryByKey(
    key: string,
  ): TypeOrmExtMetadataItemInterface<TypeOrmExtStorableRepository> {
    return this.repositories.get(key);
  }

  /**
   * Get all entities by the connection
   *
   * @param {string} connection Connection
   * @returns {TypeOrmExtMetadataItemInterface<TypeOrmExtStorableEntity>[]} Entities
   */
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

  /**
   * Get all subscribers by the connection
   *
   * @param {string} connection Connection
   * @returns {TypeOrmExtMetadataItemInterface<TypeOrmExtStorableRepository>[]} Subscribers
   */
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
