import supertest from 'supertest';
import { randomUUID } from 'crypto';
import { getDataSourceToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExceptionsFilter } from '@concepta/nestjs-common';
import { IssueTokenService } from '@concepta/nestjs-authentication';
import { AccessControlService } from '@concepta/nestjs-access-control';
import {
  PasswordCreationService,
  PasswordStorageInterface,
  PasswordStorageService,
  PasswordValidationService,
} from '@concepta/nestjs-password';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { UserFactory } from './user.factory';
import { UserLookupService } from './services/user-lookup.service';
import { UserPasswordHistoryFactory } from './user-password-history.factory';
import { UserPasswordService } from './services/user-password.service';
import { UserPasswordHistoryLookupService } from './services/user-password-history-lookup.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { UserPasswordHistoryEntityFixture } from './__fixtures__/user-password-history.entity.fixture';

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
    let userPasswordService: UserPasswordService;
    let userPasswordHistoryLookupService: UserPasswordHistoryLookupService;
    let issueTokenService: IssueTokenService;
    let accessControlService: AccessControlService;

    const userId = randomUUID();
    const userOldPassword = 'Test1233';
    const userPassword = 'Test1234';
    const userNewPassword = 'Test6789';

    beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();

      app = moduleFixture.createNestApplication();
      const exceptionsFilter = app.get(HttpAdapterHost);
      app.useGlobalFilters(new ExceptionsFilter(exceptionsFilter));

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
      userPasswordService = app.get(UserPasswordService);
      userPasswordHistoryLookupService = app.get(
        UserPasswordHistoryLookupService,
      );
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

      const userPasswordHistoryFactory = new UserPasswordHistoryFactory({
        seedingSource: seedingSource,
        entity: UserPasswordHistoryEntityFixture,
      });

      fakeUser = await userFactory.create(
        await passwordStorageService.hashObject({
          id: userId,
          password: userPassword,
        }),
      );

      await userPasswordHistoryFactory.create(
        await passwordStorageService.hashObject({
          userId: userId,
          password: userOldPassword,
        }),
      );
    }

    afterEach(async () => {
      jest.clearAllMocks();
      app && (await app.close());
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

        const userPasswordHistory =
          await userPasswordHistoryLookupService.byUserId(updatedUser.id);
        expect(userPasswordHistory).toEqual(expect.any(Array));
        expect(userPasswordHistory.length).toEqual(2);
        expect(userPasswordHistory).toEqual(
          expect.arrayContaining([
            expect.objectContaining<PasswordStorageInterface>({
              passwordHash: expect.any(String),
              passwordSalt: expect.any(String),
            }),
          ]),
        );
        expect(
          await passwordValidationService.validate({
            password: userNewPassword,
            passwordHash: userPasswordHistory[1].passwordHash as string,
            passwordSalt: userPasswordHistory[1].passwordSalt as string,
          }),
        ).toEqual(true);
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

      it('Should fail to update password (used too recently)', async () => {
        await userPasswordService.setPassword(
          { password: userNewPassword },
          userId,
        );

        const test = await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(400);

        expect(test.body.message).toEqual(
          'The new password has been used too recently, please use a different password',
        );
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
