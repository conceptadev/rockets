import { Controller } from '@nestjs/common';
import { ACCESS_CONTROL_MODULE_FILTERS_METADATA } from '../constants';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { AccessControlFilter } from './access-control-filter.decorator';

describe('@AccessControlFilter', () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterCallback: AccessControlFilterCallback = (data, user, service) => {
    return null;
  };

  @Controller()
  class TestController {
    @AccessControlFilter({
      type: AccessControlFilterType.BODY,
      filter: filterCallback,
    })
    createOne() {
      return null;
    }
    @AccessControlFilter({
      type: AccessControlFilterType.QUERY,
      filter: filterCallback,
    })
    getList() {
      return null;
    }
    @AccessControlFilter({
      type: AccessControlFilterType.PATH,
      filter: filterCallback,
    })
    getOne() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller methods with access control filters', () => {
    it('createOne should have filter on BODY metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.createOne,
      );

      expect(grants).toEqual([
        {
          type: AccessControlFilterType.BODY,
          filter: filterCallback,
        },
      ]);
    });

    it('getList should have filter on QUERY metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.getList,
      );

      expect(grants).toEqual([
        {
          type: AccessControlFilterType.QUERY,
          filter: filterCallback,
        },
      ]);
    });

    it('getList should have filter on PATH metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
        controller.getOne,
      );

      expect(grants).toEqual([
        {
          type: AccessControlFilterType.PATH,
          filter: filterCallback,
        },
      ]);
    });
  });
});
