import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { LookupService } from '../../services/lookup.service';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';
import { RepositoryInterface } from '../../interfaces/repository.interface';

@Injectable()
export class TestLookupServiceFixture extends LookupService<TestEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: RepositoryInterface<TestEntityFixture>,
  ) {
    super(repo);
  }
}
