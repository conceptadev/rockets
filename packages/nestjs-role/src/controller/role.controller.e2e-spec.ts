import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { RoleFactory } from '../role.factory';
import { RoleSeeder } from '../role.seeder';

import { RoleEntityFixture } from '../__fixtures__/entities/role-entity.fixture';
import { AppModuleCrudFixture } from '../__fixtures__/app.module.crud.fixture';

describe('RoleController (e2e)', () => {
  describe('Rest', () => {
    let app: INestApplication;
    let seedingSource: SeedingSource;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleCrudFixture],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      seedingSource = new SeedingSource({
        dataSource: app.get(getDataSourceToken()),
      });

      await seedingSource.initialize();

      const roleFactory = new RoleFactory({ entity: RoleEntityFixture });

      const roleSeeder = new RoleSeeder({
        factories: [roleFactory],
      });

      await seedingSource.run.one(roleSeeder);
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('GET /role', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/role?limit=10')
        .expect(200)
        .expect((res) => res.body.length === 10);
      expect(response);
    });

    it('GET /role/:id', async () => {
      // get an role so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/role?limit=1')
        .expect(200);

      // get one using that id
      await supertest(app.getHttpServer())
        .get(`/role/${response.body[0].id}`)
        .expect(200);
    });

    it('POST /role', async () => {
      await supertest(app.getHttpServer())
        .post('/role')
        .send({
          name: 'company 1',
        })
        .expect(201);
    });

    it('DELETE /role/:id', async () => {
      // get an role so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/role?limit=1')
        .expect(200);

      // delete one using that id
      await supertest(app.getHttpServer())
        .delete(`/role/${response.body[0].id}`)
        .expect(200);
    });
  });
});
