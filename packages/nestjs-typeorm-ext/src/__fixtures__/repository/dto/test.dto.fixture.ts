import { ReferenceId, CommonEntityDto } from '@concepta/nestjs-common';

import { TestInterfaceFixture } from '../interface/test-entity.interface.fixture';

export class TestDtoFixture
  extends CommonEntityDto
  implements TestInterfaceFixture
{
  id: ReferenceId = '';

  firstName = '';

  lastName = '';
}
