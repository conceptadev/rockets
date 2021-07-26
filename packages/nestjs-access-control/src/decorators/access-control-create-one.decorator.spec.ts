import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_FILTERS_CONFIG_KEY,
  ACCESS_CONTROL_GRANT_CONFIG_KEY,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlCreateOne } from './access-control-create-one.decorator';

describe('@AccessControlCreateOne', () => {
  const resource = 'a_protected_resource';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback: AccessControlFilterCallback = (data, user, service) => {
    return null;
  };

  @Controller()
  class TestController {
    @AccessControlCreateOne(resource)
    createOne() {
      return null;
    }
    @AccessControlCreateOne(resource, filterCallback)
    createOneFiltered() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.createOne,
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
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
        controller.createOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.createOneFiltered,
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
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
        controller.createOneFiltered,
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
