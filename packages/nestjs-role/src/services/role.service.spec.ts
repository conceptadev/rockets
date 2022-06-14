import { CrudModule } from '@concepta/nestjs-crud';
import {
  getDynamicRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { Test, TestingModule } from '@nestjs/testing';
import { RoleModule } from '../role.module';
import { RoleSeeder } from '../role.seeder';
import { RoleService } from '../services/role.service';

import { RoleEntityFixture } from '../__fixtures__/entities/role-entity.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserRoleEntityFixture } from '../__fixtures__/entities/user-role-entity.fixture';
import { RoleRepositoryFixture } from '../__fixtures__/repositories/role-repository.fixture';
import { UserRoleRepositoryFixture } from '../__fixtures__/repositories/user-role-repository.fixture';
import { ApiKeyEntityFixture } from '../__fixtures__/entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from '../__fixtures__/entities/api-key-role-entity.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { UserRoleFactoryFixture } from '../__fixtures__/factories/user-role.factory.fixture';
import { RoleFactory } from '../role.factory';

describe('RoleModule', () => {
  let testModule: TestingModule;
  let roleModule: RoleModule;
  let roleService: RoleService;
  let roleRepo: RoleRepositoryFixture;

  let testRole1: RoleEntityFixture;
  let testRole2: RoleEntityFixture;
  let testUser: UserEntityFixture;

  let connectionNumber = 1;

  beforeEach(async () => {
    const connectionName = `test_${connectionNumber++}`;

    testModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          name: connectionName,
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [
            RoleEntityFixture,
            UserEntityFixture,
            UserRoleEntityFixture,
            ApiKeyEntityFixture,
            ApiKeyRoleEntityFixture,
          ],
        }),
        RoleModule.register({
          entities: {
            role: {
              entity: RoleEntityFixture,
              repository: RoleRepositoryFixture,
              connection: connectionName,
            },
            user: {
              entity: UserRoleEntityFixture,
              connection: connectionName,
            },
            userRole: {
              entity: UserRoleEntityFixture,
              repository: UserRoleRepositoryFixture,
              connection: connectionName,
            },
          },
        }),
        CrudModule.register(),
      ],
    }).compile();

    RoleSeeder.entity = RoleEntityFixture;

    await useSeeders([], {
      root: __dirname,
      connection: connectionName,
    });

    const roleFactory = new RoleFactory(RoleEntityFixture);
    [testRole1, testRole2] = await roleFactory.createMany(2);

    const userFactory = new UserFactoryFixture();
    testUser = await userFactory.create();

    const userRoleFactory = new UserRoleFactoryFixture();
    await userRoleFactory.create({
      role: testRole1,
      assignee: testUser,
    });

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleService = testModule.get<RoleService>(RoleService);
    roleRepo = testModule.get<RoleRepositoryFixture>(
      getDynamicRepositoryToken('role'),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    testModule.close();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(roleModule).toBeInstanceOf(RoleModule);
    });
    it('should be have expected services', async () => {
      expect(roleService).toBeInstanceOf(RoleService);
    });
    it('should be have expected repos', async () => {
      expect(roleRepo).toBeInstanceOf(RoleRepositoryFixture);
    });
  });

  describe('getAssignedRoles', () => {
    it('should return assigned roles', async () => {
      const assignedRoles: Partial<RoleEntityFixture>[] =
        await roleService.getAssignedRoles('role', testUser);

      expect(assignedRoles).toBeInstanceOf(Array);
      expect(assignedRoles.length).toEqual(1);
    });
  });

  describe('isAssignedRole', () => {
    it('should be assigned to one', async () => {
      expect(
        await roleService.isAssignedRole('role', testRole1, testUser),
      ).toEqual(true);
    });

    it('should not be assigned to one', async () => {
      expect(
        await roleService.isAssignedRole('role', testRole2, testUser),
      ).toEqual(false);
    });
  });

  describe('isAssignedRoles', () => {
    it('should be assigned to all', async () => {
      expect(
        await roleService.isAssignedRoles('role', [testRole1], testUser),
      ).toEqual(true);
    });

    it('should not be assigned to all', async () => {
      expect(
        await roleService.isAssignedRoles(
          'role',
          [testRole1, testRole2],
          testUser,
        ),
      ).toEqual(false);
    });

    it('impossible to be assigned to none', async () => {
      expect(await roleService.isAssignedRoles('role', [], testUser)).toEqual(
        false,
      );
    });
  });
});
