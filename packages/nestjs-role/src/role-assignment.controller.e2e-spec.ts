import assert from 'assert';
import supertest from 'supertest';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { RoleAssignmentCreatableInterface } from '@concepta/ts-common';

import { ROLE_MODULE_ROLE_ENTITY_KEY } from './role.constants';

import { RoleFactory } from './role.factory';
import { RoleSeeder } from './role.seeder';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';
import { UserFactoryFixture } from './__fixtures__/factories/user.factory.fixture';
import { UserRoleFactoryFixture } from './__fixtures__/factories/user-role.factory.fixture';

describe('RoleAssignmentController (e2e)', () => {
  let app: INestApplication;
  let seedingSource: SeedingSource;
  let roleRepo: Repository<RoleEntityFixture>;
  let userFactory: UserFactoryFixture;
  let userRoleFactory: UserRoleFactoryFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    userFactory = new UserFactoryFixture({ seedingSource });
    userRoleFactory = new UserRoleFactoryFixture({ seedingSource });

    const roleSeeder = new RoleSeeder({
      factories: [new RoleFactory({ entity: RoleEntityFixture })],
    });

    await seedingSource.run.one(roleSeeder);

    roleRepo = app.get(getDynamicRepositoryToken(ROLE_MODULE_ROLE_ENTITY_KEY));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('GET /role-assignment/user', async () => {
    const user = await userFactory.create();
    const roles = await roleRepo.find({ take: 10 });

    for (const role of roles) {
      await userRoleFactory
        .map((userRole) => {
          userRole.role = role;
          userRole.assignee = user;
        })
        .create();
    }

    await supertest(app.getHttpServer())
      .get('/role-assignment/user?limit=10')
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.length, 10);
      });
  });

  it('GET /role-assignment/user/:id', async () => {
    const user = await userFactory.create();
    const roles = await roleRepo.find({ take: 1 });

    const userRole = await userRoleFactory
      .map((userRole) => {
        userRole.role = roles[0];
        userRole.assignee = user;
      })
      .create();

    await supertest(app.getHttpServer())
      .get(`/role-assignment/user/${userRole.id}`)
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.role.id, roles[0].id);
        assert.strictEqual(res.body.assignee.id, user.id);
      });
  });

  it('POST /role-assignment/user', async () => {
    const roles = await roleRepo.find({ take: 1 });
    const user = await userFactory.create();

    const payload: RoleAssignmentCreatableInterface = {
      role: { id: roles[0].id },
      assignee: { id: user.id },
    };

    await supertest(app.getHttpServer())
      .post('/role-assignment/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        assert.strictEqual(res.body.role.id, roles[0].id);
        assert.strictEqual(res.body.assignee.id, user.id);
      });
  });

  it('DELETE /role-assignment/user/:id', async () => {
    const user = await userFactory.create();
    const roles = await roleRepo.find({ take: 1 });

    const userRole = await userRoleFactory
      .map((userRole) => {
        userRole.role = roles[0];
        userRole.assignee = user;
      })
      .create();

    await supertest(app.getHttpServer())
      .delete(`/role-assignment/user/${userRole.id}`)
      .expect(200);
  });
});
