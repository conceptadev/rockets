import { Inject, Injectable } from '@nestjs/common';
import { TYPEORM_EXT_MODULE_CONNECTION } from './typeorm-ext.constants';
import { TypeOrmExtStorage } from './typeorm-ext.storage';
import { AbstractRepository, Connection, Repository } from 'typeorm';

@Injectable()
export class TypeOrmExtService {
  constructor(
    @Inject(TYPEORM_EXT_MODULE_CONNECTION)
    private connection: Connection,
  ) {}

  async getEntityRepository(entityKey: string) {
    // look up the entity
    const entity = TypeOrmExtStorage.getEntityByKey(entityKey);
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
    const repository = TypeOrmExtStorage.getRepositoryByKey(repoKey);
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
}
