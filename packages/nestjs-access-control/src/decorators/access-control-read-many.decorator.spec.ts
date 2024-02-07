import { Controller } from '@nestjs/common';
import { ACCESS_CONTROL_MODULE_GRANT_METADATA } from '../constants';
import { ActionEnum } from '../enums/action.enum';
import { AccessControlReadMany } from './access-control-read-many.decorator';

describe('@AccessControlReadMany', () => {
  const resource = 'a_protected_resource';

  @Controller()
  class TestController {
    @AccessControlReadMany(resource)
    getList() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.getList,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: ActionEnum.READ,
        },
      ]);
    });
  });
});
