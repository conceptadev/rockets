import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { RoleModule } from './role.module';
import { DefaultRoleLookupService } from './services/default-role-lookup.service';
import { DefaultRoleMutateService } from './services/default-role-mutate.service';
import { RoleCrudService } from './services/role-crud.service';
import { RoleController } from './role.controller';
import { RoleLookupService } from './services/role-lookup.service';
import { RoleMutateService } from './services/role-mutate.service';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import { RoleEntityFixture } from './__fixtures__/role-entity.fixture';
import { RoleRepositoryFixture } from './__fixtures__/role-repository.fixture';
import { ROLE_MODULE_ORG_ENTITY_KEY } from './role.constants';

describe('RoleModule', () => {
  let roleModule: RoleModule;
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
            entities: [RoleEntityFixture],
          }),
        }),
        RoleModule.register({
          entities: {
            role: {
              entity: RoleEntityFixture,
              repository: RoleRepositoryFixture,
            },
          },
        }),
        CrudModule.register(),
      ],
    }).compile();

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleEntityRepo = testModule.get<Repository<RoleEntityFixture>>(
      getEntityRepositoryToken(ROLE_MODULE_ORG_ENTITY_KEY),
    );
    roleDynamicRepo = testModule.get<RoleRepositoryFixture>(
      getDynamicRepositoryToken(ROLE_MODULE_ORG_ENTITY_KEY),
    );
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
