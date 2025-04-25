import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '../../../decorators/inject-dynamic-repository.decorator';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';
import { TypeOrmRepositoryAdapter } from '../../../repository/typeorm-repository.adapter';
import { Repository } from 'typeorm';

@Injectable()
export class TypeOrmRepositoryAdapterFixture extends TypeOrmRepositoryAdapter<TestEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: Repository<TestEntityFixture>,
  ) {
    super(repo);
  }
}
