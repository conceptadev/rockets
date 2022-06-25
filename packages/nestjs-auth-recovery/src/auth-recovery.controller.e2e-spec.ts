import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { useSeeders } from '@jorgebodega/typeorm-seeding';
import { UserFactory, UserSeeder } from '@concepta/nestjs-user/dist/seeding';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { RecoverPasswordDto } from './dto/recover-password.dto';

describe('AuthRecoveryController (e2e)', () => {
  describe('AuthRecovery', () => {
    let app: INestApplication;

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();
      app = moduleFixture.createNestApplication();
      await app.init();

      UserFactory.entity = UserEntityFixture;

      await useSeeders(UserSeeder, { root: __dirname, connection: 'default' });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    it('POST auth/recover-password', async () => {
      const response = await supertest(app.getHttpServer())
        .get('/user?limit=1')
        .expect(200);

      await supertest(app.getHttpServer())
        .post('/auth/recover-password')
        .send({ email: response?.body[0]?.email } as RecoverPasswordDto)
        .expect(200);
    });
  });
});
