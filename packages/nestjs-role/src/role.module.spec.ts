import { Test, TestingModule } from '@nestjs/testing';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import { RoleModule } from './role.module';
import { RoleService } from './services/role.service';
import { RoleModelService } from './services/role-model.service';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from './role.constants';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';
import { TypeOrmRepositoryAdapter } from '@concepta/nestjs-typeorm-ext';

describe('RoleModule', () => {
  let roleModule: RoleModule;
  let roleService: RoleService;
  let roleModelService: RoleModelService;
  let roleDynamicRepo: RepositoryInterface<RoleEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleDynamicRepo = testModule.get(
      getDynamicRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY),
    );
    roleService = testModule.get<RoleService>(RoleService);
    roleModelService = testModule.get<RoleModelService>(RoleModelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(roleModule).toBeInstanceOf(RoleModule);
      expect(roleDynamicRepo).toBeInstanceOf(TypeOrmRepositoryAdapter);
      expect(roleService).toBeInstanceOf(RoleService);
      expect(roleModelService).toBeInstanceOf(RoleModelService);
      expect(roleModelService['repo']).toBeInstanceOf(TypeOrmRepositoryAdapter);
      expect(roleModelService['repo'].find).toBeInstanceOf(Function);
    });
  });
});
