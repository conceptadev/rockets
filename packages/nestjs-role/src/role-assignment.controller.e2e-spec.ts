import assert from 'assert';
import supertest from 'supertest';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';

import { RoleAssignmentCreatableInterface } from './interfaces/role-assignment-creatable.interface';
import { RoleSeeder } from './role.seeder';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';
import { UserFactoryFixture } from './__fixtures__/factories/user.factory.fixture';
import { UserRoleFactoryFixture } from './__fixtures__/factories/user-role.factory.fixture';

describe('RoleAssignmentController (e2e)', () => {
  let app: INestApplication;
  let roleRepo: Repository<RoleEntityFixture>;
  const userFactory = new UserFactoryFixture();
  const userRoleFactory = new UserRoleFactoryFixture();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    RoleSeeder.entity = RoleEntityFixture;

    await useSeeders(RoleSeeder, { root: __dirname, connection: 'default' });

    roleRepo = app.get(getDynamicRepositoryToken('role'));
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
