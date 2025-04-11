import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';
import { TypeOrmRepositoryService } from '../../services/typeorm-repository.service';
import { Repository } from 'typeorm';

@Injectable()
export class TestTypeOrmRepositoryServiceFixture extends TypeOrmRepositoryService<TestEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: Repository<TestEntityFixture>,
  ) {
    super(repo);
  }
}
