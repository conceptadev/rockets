import supertest from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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
    });

    afterEach(async () => {
      jest.clearAllMocks();
      // await app.close();
    });

    // it('GET /user', async () => {
    //   await supertest(app.getHttpServer()).get('/user').expect(200);
    // });

    it('POST /user', async () => {
      await supertest(app.getHttpServer())
        .post('/user')
        .send({ id: 123 })
        .expect(201);
    });
  });
});
