import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { CrudModule } from '@concepta/nestjs-crud';
import { OrgFactory } from './org.factory';
import { OrgSeeder } from './org.seeder';
import { OrgModule } from './org.module';

import { OrgEntityFixture } from './__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from './__fixtures__/owner-entity.fixture';
import { OwnerLookupServiceFixture } from './__fixtures__/owner-lookup-service.fixture';
import { OwnerModuleFixture } from './__fixtures__/owner.module.fixture';
import { OwnerFactoryFixture } from './__fixtures__/owner-factory.fixture';

describe('OrgController (e2e)', () => {
  describe('Rest', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [
          TypeOrmExtModule.registerAsync({
            useFactory: async () => ({
              type: 'sqlite',
              database: ':memory:',
              synchronize: true,
              entities: [OrgEntityFixture, OwnerEntityFixture],
            }),
          }),
          OrgModule.registerAsync({
            imports: [OwnerModuleFixture.register()],
            inject: [OwnerLookupServiceFixture],
            useFactory: (ownerLookupService: OwnerLookupServiceFixture) => ({
              ownerLookupService,
            }),
            entities: {
              org: {
                entity: OrgEntityFixture,
              },
            },
          }),
          CrudModule.register(),
        ],
        providers: [OwnerLookupServiceFixture],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      OrgFactory.entity = OrgEntityFixture;
      OrgSeeder.ownerFactory = OwnerFactoryFixture;

      await useSeeders(OrgSeeder, {
        root: __dirname,
        connection: 'default',
      });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('GET /org', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/org?limit=10')
        .expect(200)
        .expect((res) => res.body.length === 10);
      expect(response);
    });

    it('GET /org/:id', async () => {
      // get an org so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/org?limit=1')
        .expect(200);

      // get one using that id
      await supertest(app.getHttpServer())
        .get(`/org/${response.body[0].id}`)
        .expect(200);
    });

    it('POST /org', async () => {
      const ownerFactory = new OwnerFactoryFixture();
      const owner = await ownerFactory.create();

      await supertest(app.getHttpServer())
        .post('/org')
        .send({
          name: 'company 1',
          owner,
        })
        .expect(201);
    });

    it('DELETE /org/:id', async () => {
      // get an org so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/org?limit=1')
        .expect(200);

      // delete one using that id
      await supertest(app.getHttpServer())
        .delete(`/org/${response.body[0].id}`)
        .expect(200);
    });
  });
});
