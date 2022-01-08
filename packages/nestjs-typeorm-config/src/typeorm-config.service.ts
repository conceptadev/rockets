import { Inject, Injectable } from '@nestjs/common';
import {
  TypeOrmConfigConnectionToken,
  TypeOrmConfigOptions,
} from './typeorm-config.types';
import {
  TYPEORM_CONFIG_MODULE_CONNECTION,
  TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN,
} from './typeorm-config.constants';
import { TypeOrmConfigStorage } from './typeorm-config.storage';
import { AbstractRepository, Connection, Repository } from 'typeorm';

@Injectable()
export class TypeOrmConfigService {
  constructor(
    @Inject(TYPEORM_CONFIG_MODULE_OPTIONS_TOKEN)
    private options: TypeOrmConfigOptions,
    @Inject(TYPEORM_CONFIG_MODULE_CONNECTION)
    private connection: Connection,
  ) {}

  async getEntityRepository(entityKey: string) {
    // look up the entity
    const entity = TypeOrmConfigStorage.getEntityByKey(entityKey);
    // entity configured for this connection?
    if (entity.connection === this.connection.name) {
      // yep, add it
      return this.connection.options.type === 'mongodb'
        ? this.connection.getMongoRepository(entity.useClass)
        : this.connection.getRepository(entity.useClass);
    }
  }

  async getCustomRepository(repoKey: string) {
    // look up the repo
    const repository = TypeOrmConfigStorage.getRepositoryByKey(repoKey);
    // repo configured for this connection?
    if (
      repository.connection === this.connection.name &&
      repository.useClass instanceof Function &&
      (repository.useClass.prototype instanceof Repository ||
        repository.useClass.prototype instanceof AbstractRepository)
    ) {
      // yep, add it
      return this.connection.getCustomRepository(repository.useClass);
    }
  }

  public async connectionOptions(): Promise<TypeOrmConfigOptions> {
    const connectionToken: TypeOrmConfigConnectionToken =
      this.options?.name ?? 'default';

    const entities =
      TypeOrmConfigStorage.getEntitiesByConnection(connectionToken);

    return {
      ...this.options,
      entities: entities.map((entity) => entity.useClass),
      subscribers: [],
    };
  }
}
