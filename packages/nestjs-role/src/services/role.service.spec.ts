import { CrudModule } from '@concepta/nestjs-crud';
import {
  TypeOrmExtModule,
  TypeOrmRepositoryAdapter,
} from '@concepta/nestjs-typeorm-ext';
import {
  ReferenceIdInterface,
  RepositoryInterface,
  getDynamicRepositoryToken,
} from '@concepta/nestjs-common';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { RoleModule } from '../role.module';
import { RoleService } from '../services/role.service';

import { ApiKeyEntityFixture } from '../__fixtures__/entities/api-key-entity.fixture';
import { ApiKeyRoleEntityFixture } from '../__fixtures__/entities/api-key-role-entity.fixture';
import { RoleEntityFixture } from '../__fixtures__/entities/role-entity.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserRoleEntityFixture } from '../__fixtures__/entities/user-role-entity.fixture';
import { UserRoleFactoryFixture } from '../__fixtures__/factories/user-role.factory.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { RoleAssignmentConflictException } from '../exceptions/role-assignment-conflict.exception';
import { RoleFactory } from '../role.factory';

describe('RoleModule', () => {
  let testModule: TestingModule;
  let seedingSource: SeedingSource;
  let roleModule: RoleModule;
  let roleService: RoleService;
  let roleRepo: RepositoryInterface<RoleEntityFixture>;

  let testRole1: ReferenceIdInterface;
  let testRole2: ReferenceIdInterface;
  let testRole3: ReferenceIdInterface;
  let testUser: UserEntityFixture;

  let connectionNumber = 1;

  beforeEach(async () => {
    const connectionName = `test_${connectionNumber++}`;

    testModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
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
        RoleModule.registerAsync({
          imports: [
            TypeOrmExtModule.forFeature({
              role: {
                entity: RoleEntityFixture,
                dataSource: connectionName,
              },
              userRole: {
                entity: UserRoleEntityFixture,
                dataSource: connectionName,
              },
            }),
          ],
          entities: ['userRole'],
          useFactory: () => ({
            settings: {
              assignments: {
                user: { entityKey: 'userRole' },
              },
            },
          }),
        }),
        CrudModule.forRoot({}),
      ],
    }).compile();

    seedingSource = new SeedingSource({
      dataSource: testModule.get(getDataSourceToken(connectionName)),
    });

    await seedingSource.initialize();

    const roleFactory = new RoleFactory({
      entity: RoleEntityFixture,
      seedingSource,
    });

    [testRole1, testRole2, testRole3] = await roleFactory.createMany(3);

    const userFactory = new UserFactoryFixture({ seedingSource });
    testUser = await userFactory.create();

    const userRoleFactory = new UserRoleFactoryFixture({ seedingSource });

    await userRoleFactory.create({
      roleId: testRole1.id,
      assigneeId: testUser.id,
    });

    roleModule = testModule.get<RoleModule>(RoleModule);
    roleService = testModule.get<RoleService>(RoleService);
    roleRepo = testModule.get(getDynamicRepositoryToken('role'));
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
      expect(roleRepo).toBeInstanceOf(TypeOrmRepositoryAdapter);
    });
  });

  describe('getAssignedRoles', () => {
    it('should return assigned roles', async () => {
      const assignedRoles: Partial<RoleEntityFixture>[] =
        await roleService.getAssignedRoles({
          assignment: 'user',
          assignee: testUser,
        });

      expect(assignedRoles).toBeInstanceOf(Array);
      expect(assignedRoles.length).toEqual(1);
    });
  });

  describe('isAssignedRole', () => {
    it('should be assigned to one', async () => {
      const result = await roleService.isAssignedRole({
        assignment: 'user',
        role: testRole1,
        assignee: testUser,
      });
      expect(result).toEqual(true);
    });

    it('should not be assigned to one', async () => {
      expect(
        await roleService.isAssignedRole({
          assignment: 'user',
          role: testRole2,
          assignee: testUser,
        }),
      ).toEqual(false);
    });
  });

  describe('isAssignedRoles', () => {
    it('should be assigned to all', async () => {
      expect(
        await roleService.isAssignedRoles({
          assignment: 'user',
          roles: [testRole1],
          assignee: testUser,
        }),
      ).toEqual(true);
    });

    it('should not be assigned to all', async () => {
      expect(
        await roleService.isAssignedRoles({
          assignment: 'user',
          roles: [testRole1, testRole2],
          assignee: testUser,
        }),
      ).toEqual(false);
    });

    it('impossible to be assigned to none', async () => {
      expect(
        await roleService.isAssignedRoles({
          assignment: 'user',
          roles: [],
          assignee: testUser,
        }),
      ).toEqual(false);
    });
  });

  describe('assignRole', () => {
    it('should assign a role to an assignee', async () => {
      const assignedRole = await roleService.assignRole({
        assignment: 'user',
        role: testRole2,
        assignee: testUser,
      });

      expect(assignedRole).toBeDefined();
      expect(assignedRole.roleId).toEqual(testRole2.id);
      expect(assignedRole.assigneeId).toEqual(testUser.id);
    });

    it('should throw conflict error if the role is already assigned', async () => {
      await expect(
        roleService.assignRole({
          assignment: 'user',
          role: testRole1,
          assignee: testUser,
        }),
      ).rejects.toThrow(RoleAssignmentConflictException);
    });
  });

  describe('assignRoles', () => {
    it('should assign multiple roles to an assignee', async () => {
      const rolesToAssign = [testRole2, testRole3];

      const assignedRoles = await roleService.assignRoles({
        assignment: 'user',
        roles: rolesToAssign,
        assignee: testUser,
      });

      expect(assignedRoles).toHaveLength(2);
      expect(assignedRoles[0].roleId).toEqual(testRole2.id);
      expect(assignedRoles[0].assigneeId).toEqual(testUser.id);
      expect(assignedRoles[1].roleId).toEqual(testRole3.id);
      expect(assignedRoles[1].assigneeId).toEqual(testUser.id);
    });

    it('should throw conflict error if any role is already assigned', async () => {
      const rolesToAssign = [testRole1, testRole2];

      await expect(
        roleService.assignRoles({
          assignment: 'user',
          roles: rolesToAssign,
          assignee: testUser,
        }),
      ).rejects.toThrow(RoleAssignmentConflictException);
    });
  });

  describe('revokeRole', () => {
    it('should revoke a role from an assignee', async () => {
      await roleService.revokeRole({
        assignment: 'user',
        role: testRole1,
        assignee: testUser,
      });

      const isAssigned = await roleService.isAssignedRole({
        assignment: 'user',
        role: testRole1,
        assignee: testUser,
      });

      expect(isAssigned).toBe(false);
    });

    it('should not throw an error if the role assignment does not exist', async () => {
      await expect(
        roleService.revokeRole({
          assignment: 'user',
          role: testRole2,
          assignee: testUser,
        }),
      ).resolves.toBeUndefined();
    });
  });

  describe('revokeRoles', () => {
    it('should revoke multiple roles from an assignee', async () => {
      await roleService.assignRoles({
        assignment: 'user',
        roles: [testRole2, testRole3],
        assignee: testUser,
      });

      await roleService.revokeRoles({
        assignment: 'user',
        roles: [testRole2, testRole3],
        assignee: testUser,
      });

      const isAssigned = await roleService.isAssignedRoles({
        assignment: 'user',
        roles: [testRole1],
        assignee: testUser,
      });
      expect(isAssigned).toBe(true);

      const isRole2Assigned = await roleService.isAssignedRole({
        assignment: 'user',
        role: testRole2,
        assignee: testUser,
      });

      expect(isRole2Assigned).toBe(false);

      const isRole3Assigned = await roleService.isAssignedRole({
        assignment: 'user',
        role: testRole2,
        assignee: testUser,
      });

      expect(isRole3Assigned).toBe(false);
    });

    it('should revoke all roles from an assignee', async () => {
      await roleService.assignRoles({
        assignment: 'user',
        roles: [testRole2, testRole3],
        assignee: testUser,
      });

      await roleService.revokeRoles({
        assignment: 'user',
        roles: [testRole1, testRole2, testRole3],
        assignee: testUser,
      });

      const assignedRoles = await roleService.getAssignedRoles({
        assignment: 'user',
        assignee: testUser,
      });

      expect(assignedRoles).toHaveLength(0);
    });

    it('should not throw an error if none of the role assignments exist', async () => {
      await expect(
        roleService.revokeRoles({
          assignment: 'user',
          roles: [testRole2],
          assignee: testUser,
        }),
      ).resolves.toBeUndefined();
    });
  });
});
