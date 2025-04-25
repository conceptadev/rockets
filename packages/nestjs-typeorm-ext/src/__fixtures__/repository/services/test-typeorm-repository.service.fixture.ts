import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '../../../decorators/inject-dynamic-repository.decorator';
import { TypeOrmRepositoryAdapter } from '../../../repository/typeorm-repository.adapter';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';

@Injectable()
export class TestTypeOrmRepositoryServiceFixture extends TypeOrmRepositoryAdapter<TestEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: Repository<TestEntityFixture>,
  ) {
    super(repo);
  }
}
