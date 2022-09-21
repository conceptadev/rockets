import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { LookupService } from '../../services/lookup.service';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';

@Injectable()
export class TestLookupServiceFixture extends LookupService<TestEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: Repository<TestEntityFixture>,
  ) {
    super(repo);
  }
}
