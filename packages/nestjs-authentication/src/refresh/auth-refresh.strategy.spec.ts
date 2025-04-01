import { AuthRefreshStrategy } from './auth-refresh.strategy';
import { AuthRefreshSettingsInterface } from './interfaces/auth-refresh-settings.interface';
import { mock } from 'jest-mock-extended';
import { VerifyTokenServiceInterface } from '../core/interfaces/verify-token-service.interface';
import { AuthRefreshUserLookupServiceInterface } from './interfaces/auth-refresh-user-lookup-service.interface';
import { randomUUID } from 'crypto';
import { AuthorizationPayloadInterface } from '@concepta/nestjs-common';
import { AuthRefreshUnauthorizedException } from './exceptions/auth-refresh-unauthorized.exception';

import { UserFixture } from '../__fixtures__/user/user.entity.fixture';

describe(AuthRefreshStrategy, () => {
  const USERNAME = 'username';

  let user: UserFixture;
  let settings: Partial<AuthRefreshSettingsInterface>;
  let userLookUpService: AuthRefreshUserLookupServiceInterface;
  let verifyTokenService: VerifyTokenServiceInterface;
  let authRefreshStrategy: AuthRefreshStrategy;
  let authorizationPayloadInterface: AuthorizationPayloadInterface;

  beforeEach(async () => {
    // TODO: configure JWT module to use different access and refresh secrets

    settings = mock<Partial<AuthRefreshSettingsInterface>>();

    userLookUpService = mock<AuthRefreshUserLookupServiceInterface>();
    verifyTokenService = mock<VerifyTokenServiceInterface>();
    authRefreshStrategy = new AuthRefreshStrategy(
      settings,
      verifyTokenService,
      userLookUpService,
    );

    user = new UserFixture();
    user.id = randomUUID();

    authorizationPayloadInterface = {
      sub: USERNAME,
    };

    jest.spyOn(userLookUpService, 'bySubject').mockResolvedValue(user);
  });

  it('constructor', async () => {
    settings = mock<Partial<AuthRefreshSettingsInterface>>();
    authRefreshStrategy = new AuthRefreshStrategy(
      settings,
      verifyTokenService,
      userLookUpService,
    );
    expect(true).toBeTruthy();
  });

  describe(AuthRefreshStrategy.prototype.validate, () => {
    it('should return user', async () => {
      const result = await authRefreshStrategy.validate(
        authorizationPayloadInterface,
      );
      expect(result.id).toBe(user.id);
    });

    it(`should throw UnauthorizedException`, async () => {
      jest.spyOn(userLookUpService, 'bySubject').mockResolvedValue(null);

      const t = () =>
        authRefreshStrategy.validate(authorizationPayloadInterface);
      await expect(t).rejects.toThrow(AuthRefreshUnauthorizedException);
    });
  });
});
