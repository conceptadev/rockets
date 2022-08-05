import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LookupService } from '../../services/lookup.service';
import { AUDIT_TOKEN } from '../audit.constants';
import { AuditEntityFixture } from '../audit.entity.fixture';

@Injectable()
export class AuditLookupCustomService extends LookupService<AuditEntityFixture> {
  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    protected repo: Repository<AuditEntityFixture>,
  ) {
    super(repo);
  }
}
