import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlDeleteOne } from './access-control-delete-one.decorator';

describe('@AccessControlDeleteOne', () => {
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
    @AccessControlDeleteOne(resource)
    deleteOne() {
      return null;
    }
    @AccessControlDeleteOne(resource, filterCallback)
    deleteOneFiltered() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.deleteOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.DELETE,
        },
      ]);
    });

    it('should NOT have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.deleteOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.deleteOneFiltered,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.DELETE,
        },
      ]);
    });

    it('should have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.deleteOneFiltered,
      );

      expect(filters).toEqual([
        {
          type: AccessControlFilterType.PATH,
          filter: filterCallback,
        },
      ]);
    });
  });
});
