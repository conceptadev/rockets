import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { UserSeeder } from '@concepta/nestjs-user';
import { AppModule } from './app.module';

describe('AppController (e2e)', () => {
  describe('Authentication', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      await useSeeders(UserSeeder, { root: __dirname, connection: 'default' });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('GET /user', async () => {
      await supertest(app.getHttpServer()).get('/user?limit=10').expect(200);
    });

    it('GET /user/:id', async () => {
      // get a user so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/user?limit=1')
        .expect(200);

      // get one using that id
      await supertest(app.getHttpServer())
        .get(`/user/${response.body[0].id}`)
        .expect(200);
    });

    it('POST /user', async () => {
      await supertest(app.getHttpServer())
        .post('/user')
        .send({
          username: 'user1',
          email: 'user1@dispostable.com',
          password: 'pass1',
        })
        .expect(201);
    });

    it('DELETE /user/:id', async () => {
      // get a user so we have an id
      const response = await supertest(app.getHttpServer())
        .get('/user?limit=1')
        .expect(200);

      // delete one using that id
      await supertest(app.getHttpServer())
        .delete(`/user/${response.body[0].id}`)
        .expect(200);
    });
  });
});
