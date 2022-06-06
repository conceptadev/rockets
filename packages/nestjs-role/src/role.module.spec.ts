import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
} from '@concepta/nestjs-typeorm-ext';
import { RoleModule } from './role.module';
import { DefaultRoleLookupService } from './services/default-role-lookup.service';
import { DefaultRoleMutateService } from './services/default-role-mutate.service';
import { RoleService } from './services/role.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleController } from './role.controller';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from './role.constants';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';
import { RoleRepositoryFixture } from './__fixtures__/repositories/role-repository.fixture';

describe('RoleModule', () => {
  let roleModule: RoleModule;
  let roleService: RoleService;
  let roleLookupService: DefaultRoleLookupService;
  let roleMutateService: DefaultRoleMutateService;
  let roleCrudService: RoleCrudService;
  let roleController: RoleController;
  let roleEntityRepo: Repository<RoleEntityFixture>;
  let roleDynamicRepo: RoleRepositoryFixture;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleEntityRepo = testModule.get<Repository<RoleEntityFixture>>(
      getEntityRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    );
    roleDynamicRepo = testModule.get<RoleRepositoryFixture>(
      getDynamicRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    );
    roleService = testModule.get<RoleService>(RoleService);
    roleLookupService =
      testModule.get<DefaultRoleLookupService>(RoleLookupService);
    roleMutateService =
      testModule.get<DefaultRoleMutateService>(RoleMutateService);
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
      expect(roleDynamicRepo).toBeInstanceOf(RoleRepositoryFixture);
      expect(roleService).toBeInstanceOf(RoleService);
      expect(roleCrudService).toBeInstanceOf(RoleCrudService);
      expect(roleLookupService).toBeInstanceOf(DefaultRoleLookupService);
      expect(roleLookupService['repo']).toBeInstanceOf(RoleRepositoryFixture);
      expect(roleLookupService['repo'].find).toBeInstanceOf(Function);
      expect(roleMutateService).toBeInstanceOf(DefaultRoleMutateService);
      expect(roleMutateService['repo']).toBeInstanceOf(RoleRepositoryFixture);
      expect(roleMutateService['repo'].find).toBeInstanceOf(Function);
      expect(roleController).toBeInstanceOf(RoleController);
    });
  });
});
