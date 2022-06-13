import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlReadOne } from './access-control-read-one.decorator';

describe('@AccessControlReadOne', () => {
  const resource = 'a_protected_resource';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback: AccessControlFilterCallback = (data, user, service) => {
    return Promise.resolve(false);
  };

  @Controller()
  class TestController {
    @AccessControlReadOne(resource)
    getOne() {
      return null;
    }
    @AccessControlReadOne(resource, filterCallback)
    getOneFiltered() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.getOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.READ,
        },
      ]);
    });

    it('should NOT have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.getOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.getOneFiltered,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.READ,
        },
      ]);
    });

    it('should have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.getOneFiltered,
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
