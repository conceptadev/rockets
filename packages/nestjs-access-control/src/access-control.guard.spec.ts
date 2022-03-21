import {
  ACCESS_CONTROL_MODULE_CTLR_METADATA,
  ACCESS_CONTROL_MODULE_FILTERS_METADATA,
  ACCESS_CONTROL_MODULE_GRANT_METADATA,
  ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
} from './constants';
import {
  AccessControlFilterCallback,
  AccessControlFilterOption,
} from './interfaces/access-control-filter-option.interface';
import { Controller, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AccessControl } from 'accesscontrol';
import { AccessControlAction } from './enums/access-control-action.enum';
import { AccessControlCreateOne } from './decorators/access-control-create-one.decorator';
import { AccessControlFilterService } from './interfaces/access-control-filter-service.interface';
import { AccessControlFilterType } from './enums/access-control-filter-type.enum';
import { AccessControlGrantOption } from './interfaces/access-control-grant-option.interface';
import { AccessControlGuard } from './access-control.guard';
import { AccessControlModuleOptionsInterface } from './interfaces/access-control-module-options.interface';
import { AccessControlOptions } from './interfaces/access-control-options.interface';
import { AccessControlReadMany } from './decorators/access-control-read-many.decorator';
import { AccessControlReadOne } from './decorators/access-control-read-one.decorator';
import { AccessControlServiceInterface } from './interfaces/access-control-service.interface';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { UseAccessControl } from './decorators/use-access-control.decorator';
import { mock } from 'jest-mock-extended';

describe('AccessControlModule', () => {
  const resourceNoAccess = 'protected_resource_no_access';
  const resourceGetAny = 'resource_get_any';
  const resourceGetOwn = 'resource_get_own';
  const resourceGetOneOwn = 'resource_get_one_own';
  const resourceCreateOwn = 'resource_create_own';

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
    async anyMethodName() {
      return true;
    }
  }

  class TestAccessService implements AccessControlServiceInterface {
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
    @AccessControlCreateOne(resourceCreateOwn, filterPass)
    createOwnFilterPass() {
      return undefined;
    }
    @AccessControlReadOne(resourceGetOneOwn, filterPass)
    getOneOwnFilterPass() {
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
  rules.grant('role1').readOwn(resourceGetOneOwn);
  rules.grant('role1').createOwn(resourceCreateOwn);
  rules.lock();

  let moduleRef: TestingModule;
  let guard: AccessControlGuard;
  const reflector: Reflector = new Reflector();
  const moduleConfig: AccessControlModuleOptionsInterface = {
    settings: { rules: rules },
    service: TestAccessService,
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AccessControlGuard,
        TestAccessService,
        TestFilterService,
        {
          provide: ACCESS_CONTROL_MODULE_OPTIONS_TOKEN,
          useValue: moduleConfig,
        },
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
        ACCESS_CONTROL_MODULE_CTLR_METADATA,
        TestControllerWithService,
      );

      expect(config.service).toEqual(TestFilterService);
    });
  });

  describe('access grants', () => {
    it('should not have any grants set for getOpen', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
        controller.getOpen,
      );

      expect(grants).toBeUndefined();
    });

    it('should have grants set for getNoAccess', async () => {
      const grants = reflector.get(
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
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
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
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
        ACCESS_CONTROL_MODULE_GRANT_METADATA,
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
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
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
        ACCESS_CONTROL_MODULE_FILTERS_METADATA,
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
      argsHost.getRequest.mockReturnValue({ query: { q1: 'abc' } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.getOwnFilterPass);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).toHaveBeenCalledTimes(1);
      expect(filterPass).toHaveBeenCalledWith(
        { q1: 'abc' },
        { id: 1234 },
        undefined,
      );
      expect(canActivate).toEqual(true);
    });

    it('should allow activation, body filtered', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ body: { b1: 'xyz' } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.createOwnFilterPass);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).toHaveBeenCalledTimes(1);
      expect(filterPass).toHaveBeenCalledWith(
        { b1: 'xyz' },
        { id: 1234 },
        undefined,
      );
      expect(canActivate).toEqual(true);
    });

    it('should allow activation, path filtered', async () => {
      const argsHost = mock<HttpArgumentsHost>();
      argsHost.getRequest.mockReturnValue({ params: { id: 7890 } });

      const context = mock<ExecutionContext>();
      context.getClass.mockReturnValue(TestController);
      context.getHandler.mockReturnValue(controller.getOneOwnFilterPass);
      context.switchToHttp.mockReturnValue(argsHost);

      const canActivate: boolean = await guard.canActivate(context);
      expect(filterPass).toHaveBeenCalledTimes(1);
      expect(filterPass).toHaveBeenCalledWith(
        { id: 7890 },
        { id: 1234 },
        undefined,
      );
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
        moduleRef.get(TestFilterService),
      );
      expect(canActivate).toEqual(true);
    });
  });
});
