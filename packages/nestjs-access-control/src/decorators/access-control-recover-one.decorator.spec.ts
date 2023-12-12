import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlRecoverOne } from './access-control-recover-one.decorator';

describe('@AccessControlCreateOne', () => {
  const resource = 'a_protected_resource';

  const filterCallback: AccessControlFilterCallback = (
    _data,
    _user,
    _service,
  ) => {
    return Promise.resolve(false);
  };

  @Controller()
  class TestController {
    @AccessControlRecoverOne(resource)
    recoverOne() {
      return null;
    }
    @AccessControlRecoverOne(resource, filterCallback)
    recoverOneFiltered() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.recoverOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.CREATE,
        },
      ]);
    });

    it('should NOT have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.recoverOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.recoverOneFiltered,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.CREATE,
        },
      ]);
    });

    it('should have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.recoverOneFiltered,
      );

      expect(filters).toEqual([
        {
          type: AccessControlFilterType.BODY,
          filter: filterCallback,
        },
      ]);
    });
  });
});
