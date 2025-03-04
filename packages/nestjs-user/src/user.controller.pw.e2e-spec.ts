import { AccessControlService } from '@concepta/nestjs-access-control';
import { IssueTokenService } from '@concepta/nestjs-authentication';
import { ExceptionsFilter } from '@concepta/nestjs-exception';
import {
  PasswordCreationService,
  PasswordStorageInterface,
  PasswordStorageService,
  PasswordStrengthEnum,
  PasswordValidationService,
} from '@concepta/nestjs-password';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { INestApplication } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import supertest from 'supertest';

import { UserLookupService } from './services/user-lookup.service';
import { UserPasswordHistoryLookupService } from './services/user-password-history-lookup.service';
import { UserPasswordService } from './services/user-password.service';
import { UserPasswordHistoryFactory } from './user-password-history.factory';
import { UserFactory } from './user.factory';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { UserPasswordHistoryEntityFixture } from './__fixtures__/user-password-history.entity.fixture';
import { UserEntityFixture } from './__fixtures__/user.entity.fixture';
import { UserRoleService } from './services/user-role.service';

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
    let userRoleService: UserRoleService;
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
      userRoleService = app.get(UserRoleService);
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

      const userWithPassword = await passwordStorageService.hashObject({
        id: userId,
        password: userPassword,
      });
      fakeUser = await userFactory.create(userWithPassword);

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

    describe(`UserPasswordController user WITH roles`, () => {
      it('Should update password', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;

        jest.spyOn(userLookupService, 'byId').mockResolvedValueOnce({
          ...fakeUser,
          userRoles: [
            {
              role: {
                name: 'manager',
              },
            },
          ],
        } as UserEntityFixture);

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(200);

        const updatedUser = await userLookupService.byId(userId);

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

      it('Should not update weak password for admin', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;
        userRoleService['userSettings'].passwordStrength = {
          passwordStrengthTransform: (
            options,
          ): PasswordStrengthEnum | undefined => {
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'admin')
            ) {
              return PasswordStrengthEnum.VeryStrong;
            }
            return undefined;
          },
        };

        jest.spyOn(userLookupService, 'byId').mockResolvedValue({
          ...fakeUser,
          userRoles: [
            {
              roleId: randomUUID(),
              role: {
                name: 'admin',
              },
            },
          ],
        });

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBe('Password is not strong enough');
            expect(res.body.errorCode).toBe('PASSWORD_NOT_STRONG_ERROR');
          });
      });

      it('Should not update weak password for admin', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;
        userRoleService['userSettings'].passwordStrength = {
          passwordStrengthTransform: (
            options,
          ): PasswordStrengthEnum | undefined => {
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'admin')
            ) {
              return PasswordStrengthEnum.VeryStrong;
            }
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'user')
            ) {
              return PasswordStrengthEnum.None;
            }
            return undefined;
          },
        };

        jest.spyOn(userLookupService, 'byId').mockResolvedValue({
          ...fakeUser,
          userRoles: [
            {
              roleId: randomUUID(),
              role: {
                name: 'admin',
              },
            },
            {
              roleId: randomUUID(),
              role: {
                name: 'user',
              },
            },
          ],
        });

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBe('Password is not strong enough');
            expect(res.body.errorCode).toBe('PASSWORD_NOT_STRONG_ERROR');
          });
      });

      it('Should update with weak password for admin', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;
        userRoleService['userSettings'].passwordStrength = {
          passwordStrengthTransform: (
            options,
          ): PasswordStrengthEnum | undefined => {
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'user')
            ) {
              return PasswordStrengthEnum.None;
            }
            return undefined;
          },
        };

        jest.spyOn(userLookupService, 'byId').mockResolvedValue({
          ...fakeUser,
          userRoles: [
            {
              roleId: randomUUID(),
              role: {
                name: 'user',
              },
            },
          ],
        });

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(200);
      });

      it('Should update password for admin and user ', async () => {
        passwordCreationService['settings'].requireCurrentToUpdate = false;
        userRoleService['userSettings'].passwordStrength = {
          passwordStrengthTransform: (
            options,
          ): PasswordStrengthEnum | undefined => {
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'admin')
            ) {
              return PasswordStrengthEnum.VeryStrong;
            }
            if (
              options?.roles &&
              options?.roles.some((role) => role.role?.name === 'user')
            ) {
              return PasswordStrengthEnum.None;
            }
            return undefined;
          },
        };

        jest.spyOn(userLookupService, 'byId').mockResolvedValue({
          ...fakeUser,
          userRoles: [
            {
              roleId: randomUUID(),
              role: {
                name: 'user',
              },
            },
          ],
        });

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userNewPassword,
          })
          .expect(200);

        jest.spyOn(userLookupService, 'byId').mockResolvedValue({
          ...fakeUser,
          userRoles: [
            {
              roleId: randomUUID(),
              role: {
                name: 'admin',
              },
            },
          ],
        });

        await supertest(app.getHttpServer())
          .patch(`/user/${userId}`)
          .set('Authorization', `bearer ${authToken}`)
          .send({
            password: userPassword,
          })
          .expect(400)
          .expect((res) => {
            expect(res.body.message).toBe('Password is not strong enough');
            expect(res.body.errorCode).toBe('PASSWORD_NOT_STRONG_ERROR');
          });
      });
    });
  });
});
