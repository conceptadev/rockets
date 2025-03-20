import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
} from '@concepta/nestjs-typeorm-ext';
import { RoleModule } from './role.module';
import { RoleService } from './services/role.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleController } from './role.controller';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from './role.constants';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';
import { RepositoryInterface } from '@concepta/typeorm-common';

describe('RoleModule', () => {
  let roleModule: RoleModule;
  let roleService: RoleService;
  let roleLookupService: RoleLookupService;
  let roleMutateService: RoleMutateService;
  let roleCrudService: RoleCrudService;
  let roleController: RoleController;
  let roleEntityRepo: RepositoryInterface<RoleEntityFixture>;
  let roleDynamicRepo: RepositoryInterface<RoleEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleEntityRepo = testModule.get<RepositoryInterface<RoleEntityFixture>>(
      getEntityRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    );
    roleDynamicRepo = testModule.get(
      getDynamicRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    );
    roleService = testModule.get<RoleService>(RoleService);
    roleLookupService = testModule.get<RoleLookupService>(RoleLookupService);
    roleMutateService = testModule.get<RoleMutateService>(RoleMutateService);
    roleCrudService = testModule.get<RoleCrudService>(RoleCrudService);
    roleController = testModule.get<RoleController>(RoleController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(roleModule).toBeInstanceOf(RoleModule);
      expect(roleEntityRepo).toBeInstanceOf(Repository);
      expect(roleDynamicRepo).toBeInstanceOf(Repository);
      expect(roleService).toBeInstanceOf(RoleService);
      expect(roleCrudService).toBeInstanceOf(RoleCrudService);
      expect(roleLookupService).toBeInstanceOf(RoleLookupService);
      expect(roleLookupService['repo']).toBeInstanceOf(Repository);
      expect(roleLookupService['repo'].find).toBeInstanceOf(Function);
      expect(roleMutateService).toBeInstanceOf(RoleMutateService);
      expect(roleMutateService['repo']).toBeInstanceOf(Repository);
      expect(roleMutateService['repo'].find).toBeInstanceOf(Function);
      expect(roleController).toBeInstanceOf(RoleController);
    });
  });
});
