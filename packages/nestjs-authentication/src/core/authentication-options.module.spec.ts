import { Test, TestingModule } from '@nestjs/testing';

import { JwtService } from '../jwt';
import { ValidateTokenServiceFixture } from '../__fixtures__/services/validate-token.service.fixture';
import { UserLookupServiceFixture } from '../__fixtures__/user/user-lookup.service.fixture';

import { AuthenticationOptionsModule } from './authentication-options.module';
import { AUTHENTICATION_MODULE_OPTIONS_TOKEN } from './authentication-options.module-definition';
import { AuthenticationCombinedOptionsInterface } from './interfaces/authentication-combined-options.interface';

describe('AuthenticationCombinedModule Integration', () => {
  let testModule: TestingModule;
  let options: AuthenticationCombinedOptionsInterface;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [
        AuthenticationOptionsModule.registerAsync({
          imports: [],
          useFactory: () => ({
            jwt: {
              settings: {
                access: { secret: 'test-access-secret' },
                default: { secret: 'test-default-secret' },
                refresh: { secret: 'test-refresh-secret' },
              },
            },
            authentication: {
              validateTokenService: new ValidateTokenServiceFixture(),
            },
            services: {
              jwtService: new JwtService(),
              userLookupService: new UserLookupServiceFixture(),
            },
          }),
          inject: [],
        }),
      ],
    }).compile();
  });

  it('should define all required services and strategies', async () => {
    options = testModule.get(AUTHENTICATION_MODULE_OPTIONS_TOKEN);
    expect(options).toBeDefined();
  });
});
