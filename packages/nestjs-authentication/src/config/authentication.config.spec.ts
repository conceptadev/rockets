import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  authenticationConfig,
  AuthenticationConfigFactory,
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
  CREDENTIAL_LOOKUP_SERVICE_TOKEN,
} from './authentication.config';

describe('authentication configuration', () => {
  let envOriginal: NodeJS.ProcessEnv;

  beforeEach(async () => {
    envOriginal = process.env;
  });

  afterEach(async () => {
    process.env = envOriginal;
    jest.clearAllMocks();
  });

  describe('options token', () => {
    it('should be defined', async () => {
      expect(AUTHENTICATION_MODULE_CONFIG_TOKEN).toEqual(
        'AUTHENTICATION_MODULE_CONFIG',
      );
      expect(CREDENTIAL_LOOKUP_SERVICE_TOKEN).toEqual(
        'CREDENTIAL_LOOKUP_SERVICE',
      );
    });
  });

  describe('authenticationConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(authenticationConfig)],
        providers: [],
      }).compile();

      const config: AuthenticationConfigFactory =
        moduleRef.get<AuthenticationConfigFactory>(authenticationConfig.KEY);

      expect(config).toMatchObject({
        maxPasswordAttempts: 3,
        minPasswordStrength: 8,
      });
    });

    describe('authenticationConfig', () => {
      it('config', async () => {
        const config = await authenticationConfig();

        expect(config.maxPasswordAttempts).toBe(3);
        expect(config.minPasswordStrength).toBe(8);
      });

      it('configProcessNotNull', async () => {
        process.env.AUTHENTICATION_MAX_PASSWORD_ATTEMPTS = '1';
        process.env.AUTHENTICATION_MIN_PASSWORD_STRENGTH = '2';

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationConfig)],
          providers: [],
        }).compile();

        const config: AuthenticationConfigFactory =
          moduleRef.get<AuthenticationConfigFactory>(authenticationConfig.KEY);

        expect(config).toMatchObject({
          maxPasswordAttempts: 1,
          minPasswordStrength: 2,
        });
      });

      it('configProcessNull', async () => {
        process.env.AUTHENTICATION_MAX_PASSWORD_ATTEMPTS = 'test';
        process.env.AUTHENTICATION_MIN_PASSWORD_STRENGTH = 'test';

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationConfig)],
          providers: [],
        }).compile();

        const config: AuthenticationConfigFactory =
          moduleRef.get<AuthenticationConfigFactory>(authenticationConfig.KEY);

        expect(config).toMatchObject({
          maxPasswordAttempts: NaN,
          minPasswordStrength: NaN,
        });
      });

      it('configProcessNull', async () => {
        delete process.env.AUTHENTICATION_MAX_PASSWORD_ATTEMPTS;
        delete process.env.AUTHENTICATION_MIN_PASSWORD_STRENGTH;

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationConfig)],
          providers: [],
        }).compile();

        const config: AuthenticationConfigFactory =
          moduleRef.get<AuthenticationConfigFactory>(authenticationConfig.KEY);

        expect(config).toMatchObject({
          maxPasswordAttempts: 3,
          minPasswordStrength: 8,
        });
      });
    });
  });
});
