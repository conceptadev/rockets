import { Controller } from '@nestjs/common';
import {
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
} from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlReplaceOne } from './access-control-replace-one.decorator';

describe('@AccessControlUpdateOne', () => {
  const resource = 'a_protected_resource';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback: AccessControlFilterCallback = (data, user, service) => {
    return Promise.resolve(false);
  };

  @Controller()
  class TestController {
    @AccessControlReplaceOne(resource)
    replaceOne() {
      return null;
    }
    @AccessControlReplaceOne(resource, filterCallback)
    replaceOneFiltered() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller method with access control', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.replaceOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.UPDATE,
        },
      ]);
    });

    it('should NOT have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.replaceOne,
      );

      expect(filters).toBeUndefined();
    });
  });

  describe('enhance controller method with access control and filter', () => {
    it('should have grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.replaceOneFiltered,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.UPDATE,
        },
      ]);
    });

    it('should have filters metadata', () => {
      const filters = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.replaceOneFiltered,
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
