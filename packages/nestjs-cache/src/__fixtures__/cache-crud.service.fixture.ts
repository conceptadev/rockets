import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@concepta/nestjs-crud';
import { CacheInterface } from '@concepta/nestjs-common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCacheEntityFixture } from './entities/user-cache-entity.fixture';

/**
 * Cache CRUD service
 */
@Injectable()
export class CacheCrudServiceFixture extends TypeOrmCrudService<CacheInterface> {
  /**
   * Constructor
   *
   * @param repo - instance of the cache repository.
   */
  constructor(
    @InjectRepository(UserCacheEntityFixture)
    repo: Repository<CacheInterface>,
  ) {
    super(repo);
  }
}
