import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MutateService } from '../../services/mutate.service';
import { AUDIT_TOKEN } from '../audit.constants';
import { AuditEntityFixture } from '../audit.entity.fixture';
import { AuditEntityCreateFixtureDto } from '../dto/audit-entity-create-fixture.dto';
import { AuditEntityUpdateFixtureDto } from '../dto/audit-entity-update-fixture.dto';
import { AuditEntityCreatableFixtureInterface } from '../interface/audit.entity.creatable.fixture.interface';
import { AuditEntityFixtureInterface } from '../interface/audit.entity.fixture.interface';
import { AuditEntityUpdatableFixtureInterface } from '../interface/audit.entity.updatable.fixture.interface';

@Injectable()
export class AuditMutateCustomService extends MutateService<
  AuditEntityFixtureInterface,
  AuditEntityCreatableFixtureInterface,
  AuditEntityUpdatableFixtureInterface
> {
  protected createDto = AuditEntityCreateFixtureDto;
  protected updateDto = AuditEntityUpdateFixtureDto;

  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    protected repo: Repository<AuditEntityFixture>,
  ) {
    super(repo);
  }
}
