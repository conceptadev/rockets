import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { AuthorizationPayloadInterface } from '@concepta/nestjs-common';
import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
import { AuthJwtUserModelServiceInterface } from './interfaces/auth-jwt-user-model-service.interface';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { AuthJwtUnauthorizedException } from './exceptions/auth-jwt-unauthorized.exception';
import { UserFixture } from './__fixtures__/user/user.entity.fixture';

describe(AuthJwtStrategy, () => {
  let user: UserFixture;
  let settings: Partial<AuthJwtSettingsInterface>;
  let verifyToken: VerifyTokenServiceInterface;
  let userModelService: AuthJwtUserModelServiceInterface;
  let authJwtStrategy: AuthJwtStrategy;
  let authorizationPayload: AuthorizationPayloadInterface;

  beforeEach(async () => {
    settings = mock<Partial<AuthJwtSettingsInterface>>();
    verifyToken = mock<VerifyTokenServiceInterface>();
    userModelService = mock<AuthJwtUserModelServiceInterface>();
    authJwtStrategy = new AuthJwtStrategy(
      settings,
      verifyToken,
      userModelService,
    );
    authorizationPayload = mock<AuthorizationPayloadInterface>();
    user = new UserFixture();
    user.id = randomUUID();
  });

  describe(AuthJwtStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest
        .spyOn(userModelService, 'bySubject')
        .mockImplementationOnce(async () => {
          return user;
        });
      const userResponse = await authJwtStrategy.validate(authorizationPayload);
      expect(userResponse.id).toBe(user.id);
    });

    it('should throw error', async () => {
      jest.spyOn(userModelService, 'bySubject').mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolve(null);
        });
      });
      const t = async () => {
        await authJwtStrategy.validate(authorizationPayload);
      };
      await expect(t).rejects.toThrow(AuthJwtUnauthorizedException);
    });
  });
});
