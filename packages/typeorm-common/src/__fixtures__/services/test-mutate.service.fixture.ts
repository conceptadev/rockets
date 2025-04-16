import { Injectable } from '@nestjs/common';
import { RepositoryInterface } from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '@concepta/nestjs-typeorm-ext';
import { MutateService } from '../../services/mutate.service';
import { AUDIT_TOKEN } from '../test.constants.fixture';
import { TestEntityFixture } from '../test.entity.fixture';
import { AuditEntityCreateDtoFixture } from '../dto/test-create.dto.fixture';
import { TestUpdateDtoFixture } from '../dto/test-update.dto.fixture';
import { TestCreatableInterfaceFixture } from '../interface/test-creatable.interface.fixture';
import { TestInterfaceFixture } from '../interface/test-entity.interface.fixture';
import { TestUpdatableInterfaceFixture } from '../interface/test-updatable.interface.fixture';

@Injectable()
export class TestMutateServiceFixture extends MutateService<
  TestInterfaceFixture,
  TestCreatableInterfaceFixture,
  TestUpdatableInterfaceFixture
> {
  protected createDto = AuditEntityCreateDtoFixture;
  protected updateDto = TestUpdateDtoFixture;

  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: RepositoryInterface<TestEntityFixture>,
  ) {
    super(repo);
  }
}
