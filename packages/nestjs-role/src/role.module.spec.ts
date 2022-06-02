import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { RoleModule } from './role.module';
import { DefaultRoleLookupService } from './services/default-role-lookup.service';
import { DefaultRoleMutateService } from './services/default-role-mutate.service';
import { RoleService } from './services/role.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleController } from './role.controller';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { ROLE_MODULE_ROLE_ENTITY_KEY } from './role.constants';

import { RoleEntityFixture } from './__fixtures__/role-entity.fixture';
import { RoleRepositoryFixture } from './__fixtures__/role-repository.fixture';
import { UserRoleRepositoryFixture } from './__fixtures__/user-role-repository.fixture';
import { UserRoleEntityFixture } from './__fixtures__/user-role-entity.fixture';
import { ApiKeyRoleEntityFixture } from './__fixtures__/api-key-role-entity.fixture';
import { ApiKeyRoleRepositoryFixture } from './__fixtures__/api-key-role-repository.fixture';
import { UserEntityFixture } from './__fixtures__/user-entity.fixture';
import { ApiKeyEntityFixture } from './__fixtures__/api-key-entity.fixture';

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
      imports: [
        TypeOrmExtModule.registerAsync({
          useFactory: async () => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [
              RoleEntityFixture,
              UserEntityFixture,
              UserRoleEntityFixture,
              ApiKeyEntityFixture,
              ApiKeyRoleEntityFixture,
            ],
          }),
        }),
        RoleModule.register({
          entities: {
            role: {
              entity: RoleEntityFixture,
              repository: RoleRepositoryFixture,
            },
            user: {
              entity: UserRoleEntityFixture,
            },
            userRole: {
              entity: UserRoleEntityFixture,
              repository: UserRoleRepositoryFixture,
            },
            apiKey: {
              entity: ApiKeyEntityFixture,
            },
            apiKeyRole: {
              entity: ApiKeyRoleEntityFixture,
              repository: ApiKeyRoleRepositoryFixture,
            },
          },
        }),
        CrudModule.register(),
      ],
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
      expect(roleLookupService['roleRepo']).toBeInstanceOf(
        RoleRepositoryFixture,
      );
      expect(roleLookupService['roleRepo'].find).toBeInstanceOf(Function);
      expect(roleMutateService).toBeInstanceOf(DefaultRoleMutateService);
      expect(roleMutateService['repo']).toBeInstanceOf(RoleRepositoryFixture);
      expect(roleMutateService['repo'].find).toBeInstanceOf(Function);
      expect(roleController).toBeInstanceOf(RoleController);
    });
  });
});
