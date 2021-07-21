import { Controller } from '@nestjs/common';
import { UseAccessControl } from './use-access-control.decorator';
import { ACCESS_CONTROL_CTLR_CONFIG_KEY } from '../constants';

describe('@UseAccessControl', () => {
  @Controller()
  @UseAccessControl()
  class TestController {}

  it('should enhance class with expected use access control metadata', () => {
    const metadata = Reflect.getMetadata(
      ACCESS_CONTROL_CTLR_CONFIG_KEY,
      TestController,
    );
    expect(metadata).toEqual(['????']);
  });
});
