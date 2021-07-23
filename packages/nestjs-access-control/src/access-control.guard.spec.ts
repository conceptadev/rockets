import { Reflector } from '@nestjs/core';
import { Controller, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { AccessControl } from 'accesscontrol';
import { AccessControlModuleOptions } from './interfaces/access-control-module-options.interface';
import { AccessControlService } from './interfaces/access-control-service.interface';
import { AccessControlGuard } from './access-control.guard';
import { UseAccessControl } from './decorators/use-access-control.decorator';
import { AccessControlReadOne } from './decorators/access-control-read-one.decorator';
import {
  ACCESS_CONTROL_CTLR_CONFIG_KEY,
  ACCESS_CONTROL_FILTERS_CONFIG_KEY,
  ACCESS_CONTROL_GRANT_CONFIG_KEY,
  ACCESS_CONTROL_OPTIONS_KEY,
} from './constants';
import { AccessControlAction } from './enums/access-control-action.enum';
import {
  AccessControlFilterCallback,
  AccessControlFilterOption,
} from './interfaces/access-control-filter-option.interface';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { AccessControlReadMany } from './decorators/access-control-read-many.decorator';
import { AccessControlFilterType } from './enums/access-control-filter-type.enum';
import { AccessControlGrantOption } from './interfaces/access-control-grant-option.interface';
import { AccessControlFilterService } from './interfaces/access-control-filter-service.interface';
import { AccessControlOptions } from './interfaces/access-control-options.interface';

describe('AccessControlModule', () => {
  const resourceNoAccess = 'protected_resource_no_access';
  const resourceGetAny = 'resource_get_any';
  const resourceGetOwn = 'resource_get_own';

  const filterFail: AccessControlFilterCallback = jest
    .fn()
    .mockResolvedValue(false);

  const filterPass: AccessControlFilterCallback = jest
    .fn()
    .mockResolvedValue(true);

  class TestUser {
    constructor(public id: number) {}
  }

  class TestFilterService implements AccessControlFilterService {
    foo: 'bar';
  }

  class TestAccessService implements AccessControlService {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUser<T>(context: ExecutionContext): Promise<T> {
      return new TestUser(1234) as unknown as T;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getUserRoles(context: ExecutionContext): Promise<string | string[]> {
      return ['role1'];
    }
  }

  @Controller()
  @UseAccessControl()
  class TestController {
    getOpen() {
      return undefined;
    }
    @AccessControlReadOne(resourceNoAccess)
    getNoAccess() {
      return undefined;
    }
    @AccessControlReadOne(resourceGetAny)
    getAny() {
      return undefined;
    }
    @AccessControlReadOne(resourceGetOwn)
    getOwn() {
      return undefined;
    }
    @AccessControlReadMany(resourceGetOwn, filterFail)
    getOwnFilterFail() {
      return undefined;
    }
    @AccessControlReadMany(resourceGetOwn, filterPass)
    getOwnFilterPass() {
      return undefined;
    }
  }

  @Controller()
  @UseAccessControl({ service: TestFilterService })
  class TestControllerWithService {
    @AccessControlReadMany(resourceGetOwn, filterPass)
    getOwnFilterPass() {
      return undefined;
    }
  }

  const controller = new TestController();
  const controllerWithService = new TestControllerWithService();

  const rules = new AccessControl();
  rules.grant('role1').readAny(resourceGetAny);
  rules.grant('role1').readOwn(resourceGetOwn);
  rules.lock();

  let moduleRef: TestingModule;
  let guard: AccessControlGuard;
  const reflector: Reflector = new Reflector();
  const moduleConfig: AccessControlModuleOptions = {
    rules: rules,
    service: TestAccessService,
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AccessControlGuard,
        TestAccessService,
        TestFilterService,
        { provide: ACCESS_CONTROL_OPTIONS_KEY, useValue: moduleConfig },
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = moduleRef.get<AccessControlGuard>(AccessControlGuard);
  });

  describe('guard provider', () => {
    it('should be of correct type', async () => {
      expect(guard).toBeInstanceOf(AccessControlGuard);
    });
  });

  describe('access filter service', () => {
    it('should be configured', async () => {
      const config: AccessControlOptions = reflector.get(
        ACCESS_CONTROL_CTLR_CONFIG_KEY,
        TestControllerWithService,
      );

      expect(config.service).toEqual(TestFilterService);
    });
  });

  describe('access grants', () => {
    it('should not have any grants set for getOpen', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.getOpen,
      );

      expect(grants).toBeUndefined();
    });

    it('should have grants set for getNoAccess', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.getNoAccess,
      );

      expect(grants).toEqual<AccessControlGrantOption[]>([
        {
          action: AccessControlAction.READ,
          resource: resourceNoAccess,
        },
      ]);
    });

    it('should have grants set for getAny', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.getAny,
      );

      expect(grants).toEqual<AccessControlGrantOption[]>([
        {
          action: AccessControlAction.READ,
          resource: resourceGetAny,
        },
      ]);
    });

    it('should have grants set for getOwn', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_GRANT_CONFIG_KEY,
        controller.getOwn,
      );

      expect(grants).toEqual<AccessControlGrantOption[]>([
        {
          action: AccessControlAction.READ,
          resource: resourceGetOwn,
        },
      ]);
    });
  });

  describe('access filters', () => {
    it('should have filters set for getOwnFilterFail', async () => {
      const filters = reflector.get(
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
        controller.getOwnFilterFail,
      );

      expect(filters).toEqual<AccessControlFilterOption[]>([
        {
          type: AccessControlFilterType.QUERY,
          filter: filterFail,
        },
      ]);
    });

    it('should have filters set for getOwnFilterPass', async () => {
      const filters = reflector.get(
        ACCESS_CONTROL_FILTERS_CONFIG_KEY,
        controller.getOwnFilterPass,
      );

      expect(filters).toEqual<AccessControlFilterOption[]>([
        {
          type: AccessControlFilterType.QUERY,
          filter: filterPass,
        },
      ]);
    });
  });

  describe('canActivate', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should allow activation (no acl applied)', async () => {
      const context = mock<ExecutionContext>();
      context.getHandler.mockReturnValue(controller.getOpen);
      const canActivate: boolean = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
    });

    it('should NOT allow activation', async () => {
      const context = mock<ExecutionContext>();
      context.getHandler.mockReturnValue(controller.getNoAccess);
      const canActivate: boolean = await guard.canActivate(context);
      expect(canActivate).toEqual(false);
    });

    it('should allow activation for read any of resource', async () => {
      const context = mock<ExecutionContext>();
      context.getHandler.mockReturnValue(controller.getAny);
      const canActivate: boolean = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
    });

    it('should allow activation for read own of resource', async () => {
      const context = mock<ExecutionContext>();
      context.getHandler.mockReturnValue(controller.getOwn);
      const canActivate: boolean = await guard.canActivate(context);
      expect(canActivate).toEqual(true);
    });

    it('should NOT allow activation, filter type not found on request', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ not_a_valide_type: {} });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.getOwnFilterPass);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).not.toHaveBeenCalled();
      expect(canActivate).toEqual(false);
    });

    it('should NOT allow activation, query filtered', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ query: { foo: 'bar' } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.getOwnFilterFail);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterFail).toHaveBeenCalledTimes(1);
      expect(canActivate).toEqual(false);
    });

    it('should allow activation, query filtered', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ query: { foo: 'bar' } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.getOwnFilterPass);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).toHaveBeenCalledTimes(1);
      expect(canActivate).toEqual(true);
    });

    it('should allow activation, query filtered, with configured filter service', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ query: { foo: 'bar' } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestControllerWithService);
      context.getHandler.mockReturnValue(
        controllerWithService.getOwnFilterPass,
      );
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).toHaveBeenCalledTimes(1);
      expect(filterPass).toHaveBeenCalledWith(
        { foo: 'bar' },
        { id: 1234 },
        TestFilterService,
      );
      expect(canActivate).toEqual(true);
    });
  });
});
