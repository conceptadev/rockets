import supertest from 'supertest';
import { randomUUID } from 'crypto';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IssueTokenService } from '@concepta/nestjs-authentication';
import { AccessControlService } from '@concepta/nestjs-access-control';
import {
  PasswordCreationService,
  PasswordStorageService,
  PasswordValidationService,
} from '@concepta/nestjs-password';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { UserFactory } from './user.factory';
import { UserLookupService } from './services/user-lookup.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';

describe('User Controller (password e2e)', () => {
  describe('Password Update Flow', () => {
    let app: INestApplication;
    let seedingSource: SeedingSource;
    let fakeUser: UserEntityFixture;
    let authToken: string;
    let passwordValidationService: PasswordValidationService;
    let passwordStorageService: PasswordStorageService;
    let passwordCreationService: PasswordCreationService;
    let userLookupService: UserLookupService;
    let issueTokenService: IssueTokenService;
    let accessControlService: AccessControlService;

    const userId = randomUUID();
    const userPassword = 'Test1234';
    const userNewPassword = 'Test6789';

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      await initSeeding();
      await setVariables();
      await createFakeUsers();
    });

    async function initSeeding() {
      seedingSource = new SeedingSource({
        dataSource: app.get(getDataSourceToken()),
      });

      await seedingSource.initialize();
    }

    async function setVariables() {
      passwordValidationService = app.get(PasswordValidationService);
      passwordStorageService = app.get(PasswordStorageService);
      passwordCreationService = app.get(PasswordCreationService);
      userLookupService = app.get(UserLookupService);
      issueTokenService = app.get(IssueTokenService);
      accessControlService = app.get(AccessControlService);
      authToken = await issueTokenService.accessToken({ sub: userId });

      // spys
      jest
        .spyOn(accessControlService, 'getUserRoles')
        .mockResolvedValue(['user']);
    }

    async function createFakeUsers() {
      const userFactory = new UserFactory({
        seedingSource: seedingSource,
        entity: UserEntityFixture,
      });

      fakeUser = await userFactory.create(
        await passwordStorageService.hashObject({
          id: userId,
          password: userPassword,
        }),
      );

      await userFactory.save(fakeUser);
    }

    afterEach(async () => {
      jest.clearAllMocks();
      return app ? await app.close() : undefined;
    });

    describe(`UserPasswordController WITH current password required`, () => {
      it('Should update password', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = true;

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
            passwordCurrent: userPassword,
          })
          .expect(200);

        const updatedUser = await userLookupService.byId(userId);
        expect(updatedUser).toBeInstanceOf(UserEntityFixture);

        if (updatedUser) {
          const isPasswordValid =
            await passwordValidationService.validateObject(
              userNewPassword,
              updatedUser,
            );
          expect(isPasswordValid).toEqual<boolean>(true);
        } else {
          fail('User not found');
        }
      });

      it('Should fail to update password', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = true;

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
            passwordCurrent: 'wrong password',
          })
          .expect(400);

        const unchangedUser = await userLookupService.byId(userId);
        expect(unchangedUser).toBeInstanceOf(UserEntityFixture);

        if (unchangedUser) {
          expect(unchangedUser.passwordHash?.length).toBeGreaterThan(0);
          expect(unchangedUser.passwordHash).toEqual<string | null>(
            fakeUser?.passwordHash,
          );
        } else {
          fail('User not found');
        }
      });
    });

    describe(`UserPasswordController WITHOUT current password required`, () => {
      it('Should update password', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(200);

        const updatedUser = await userLookupService.byId(userId);
        expect(updatedUser).toBeInstanceOf(UserEntityFixture);

        if (updatedUser) {
          const isPasswordValid =
            await passwordValidationService.validateObject(
              userNewPassword,
              updatedUser,
            );
          expect(isPasswordValid).toEqual<boolean>(true);
        } else {
          fail('User not updated');
        }
      });
    });
  });
});
