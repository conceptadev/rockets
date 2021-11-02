import supertest from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from './app.module';
import { INestApplication } from '@nestjs/common';

import { AuthenticationStrategyLocalInterface } from '@rockts-org/nestjs-authentication';

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
      await app.close();
    });

    it('POST /sign', async () => {
      const sign = {
        username: 'first_user',
        password: 'AS12378',
      };

      await supertest(app.getHttpServer())
        .post('/sign')
        .send(sign)
        .expect(201)
        .expect((response: AuthenticationStrategyLocalInterface) => {
          return response.username == sign.username;
        });

      return;
    });
  });
});
