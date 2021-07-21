import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_FILTERS_CONFIG_KEY,
  ACCESS_CONTROL_GRANT_CONFIG_KEY,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlDeleteOne } from './access-control-delete-one.decorator';

describe('@AccessControlDeleteOne', () => {
  const resource = 'a_protected_resource';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback: AccessControlFilterCallback = (data, user, service) => {
    return null;
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
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
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
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
        controller.deleteOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
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
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
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
