import { Injectable } from '@nestjs/common';
import { ModelService, RepositoryInterface } from '@concepta/nestjs-common';
import { InjectDynamicRepository } from '../../decorators/inject-dynamic-repository.decorator';
import { AUDIT_TOKEN } from '../repository/test.constants.fixture';
import { TestEntityFixture } from '../repository/test.entity.fixture';
import { TestCreateDtoFixture } from '../repository/dto/test-create.dto.fixture';
import { TestUpdateDtoFixture } from '../repository/dto/test-update.dto.fixture';
import { TestCreatableInterfaceFixture } from '../repository/interface/test-creatable.interface.fixture';
import { TestInterfaceFixture } from '../repository/interface/test-entity.interface.fixture';
import { TestUpdatableInterfaceFixture } from '../repository/interface/test-updatable.interface.fixture';

@Injectable()
export class TestModelServiceFixture extends ModelService<
  TestInterfaceFixture,
  TestCreatableInterfaceFixture,
  TestUpdatableInterfaceFixture
> {
  protected createDto = TestCreateDtoFixture;
  protected updateDto = TestUpdateDtoFixture;

  constructor(
    @InjectDynamicRepository(AUDIT_TOKEN)
    repo: RepositoryInterface<TestEntityFixture>,
  ) {
    super(repo);
  }
}
