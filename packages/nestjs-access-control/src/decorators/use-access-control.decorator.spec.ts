import { Controller } from '@nestjs/common';
import { UseAccessControl } from './use-access-control.decorator';
import { ACCESS_CONTROL_MODULE_CTLR_METADATA } from '../constants';
import { AccessControlFilterService } from '../interfaces/access-control-filter-service.interface';

describe('@UseAccessControl', () => {
  class TestFilterService implements AccessControlFilterService {}

  @Controller()
  @UseAccessControl({ service: TestFilterService })
  class TestController {}

  it('should enhance class with expected use access control metadata', () => {
    const metadata = Reflect.getOwnMetadata(
      ACCESS_CONTROL_MODULE_CTLR_METADATA,
      TestController,
    );
    expect(metadata).toEqual(
      expect.objectContaining({ service: TestFilterService }),
    );
  });
});
