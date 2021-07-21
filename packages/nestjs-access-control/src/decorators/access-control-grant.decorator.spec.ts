import { Controller } from '@nestjs/common';
import { ACCESS_CONTROL_GRANT_CONFIG_KEY } from '../constants';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlGrant } from './access-control-grant.decorator';

describe('@AccessControlGrant', () => {
  const resource = 'a_protected_resource';

  @Controller()
  class TestController {
    @AccessControlGrant({
      resource: resource,
      action: AccessControlAction.CREATE,
    })
    createOne() {
      return null;
    }
    @AccessControlGrant({
      resource: resource,
      action: AccessControlAction.READ,
    })
    getOne() {
      return null;
    }
    @AccessControlGrant({
      resource: resource,
      action: AccessControlAction.UPDATE,
    })
    updateOne() {
      return null;
    }
    @AccessControlGrant({
      resource: resource,
      action: AccessControlAction.DELETE,
    })
    deleteOne() {
      return null;
    }
  }

  const controller = new TestController();

  describe('enhance controller methods with access control grants', () => {
    it('createOne should have create grants metadata', () => {
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

    it('getOne should have read grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.getOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.READ,
        },
      ]);
    });

    it('updateOne should have update grants metadata', () => {
      const grants = Reflect.getMetadata(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.updateOne,
      );

      expect(grants).toEqual([
        {
          resource: resource,
          action: AccessControlAction.UPDATE,
        },
      ]);
    });

    it('deleteOne should have delete grants metadata', () => {
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
  });
});
