import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { CacheInterface } from '@concepta/ts-common';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
/**
 * Cache CRUD service
 */
@Injectable()
export class CacheCrudService extends TypeOrmCrudService<CacheInterface> {
  /**
   * Constructor
   *
   * @param repo instance of the cache repository.
   */
  constructor(repo: Repository<CacheInterface>) {
    super(repo);
  }
}
