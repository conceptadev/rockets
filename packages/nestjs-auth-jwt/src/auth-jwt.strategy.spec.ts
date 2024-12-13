import { mock } from 'jest-mock-extended';
import { AuthJwtUserLookupServiceInterface } from './interfaces/auth-jwt-user-lookup-service.interface';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import { UserFixture } from './__fixtures__/user/user.entity.fixture';
import { randomUUID } from 'crypto';
import { AuthorizationPayloadInterface } from '@concepta/nestjs-common';
import { AuthJwtSettingsInterface } from './interfaces/auth-jwt-settings.interface';
import { VerifyTokenServiceInterface } from '@concepta/nestjs-authentication';
import { AuthJwtUnauthorizedException } from './exceptions/auth-jwt-unauthorized.exception';

describe(AuthJwtStrategy, () => {
  let user: UserFixture;
  let settings: Partial<AuthJwtSettingsInterface>;
  let verifyToken: VerifyTokenServiceInterface;
  let userLookUpService: AuthJwtUserLookupServiceInterface;
  let authJwtStrategy: AuthJwtStrategy;
  let authorizationPayload: AuthorizationPayloadInterface;

  beforeEach(async () => {
    settings = mock<Partial<AuthJwtSettingsInterface>>();
    verifyToken = mock<VerifyTokenServiceInterface>();
    userLookUpService = mock<AuthJwtUserLookupServiceInterface>();
    authJwtStrategy = new AuthJwtStrategy(
      settings,
      verifyToken,
      userLookUpService,
    );
    authorizationPayload = mock<AuthorizationPayloadInterface>();
    user = new UserFixture();
    user.id = randomUUID();
  });

  describe(AuthJwtStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest
        .spyOn(userLookUpService, 'bySubject')
        .mockImplementationOnce(async () => {
          return user;
        });
      const userResponse = await authJwtStrategy.validate(authorizationPayload);
      expect(userResponse.id).toBe(user.id);
    });

    it('should throw error', async () => {
      jest.spyOn(userLookUpService, 'bySubject').mockImplementationOnce(() => {
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
