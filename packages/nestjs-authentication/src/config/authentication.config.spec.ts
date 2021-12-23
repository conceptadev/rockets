import {
  AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  CREDENTIAL_LOOKUP_SERVICE_TOKEN,
  authenticationOptions,
} from './authentication.config';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';
import { ConfigModule } from '@nestjs/config';

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
      expect(AUTHENTICATION_MODULE_OPTIONS_TOKEN).toEqual(
        'AUTHENTICATION_MODULE_OPTIONS',
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
        imports: [ConfigModule.forFeature(authenticationOptions)],
        providers: [],
      }).compile();

      const config: AuthenticationOptionsInterface =
        moduleRef.get<AuthenticationOptionsInterface>(
          authenticationOptions.KEY,
        );

      expect(config).toMatchObject({
        maxPasswordAttempts: 3,
        minPasswordStrength: 8,
      });
    });

    describe('authenticationConfig', () => {
      it('config', async () => {
        const config = await authenticationOptions();

        expect(config.maxPasswordAttempts).toBe(3);
        expect(config.minPasswordStrength).toBe(8);
      });

      it('configProcessNotNull', async () => {
        process.env.PASSWORD_MAX_PASSWORD_ATTEMPTS = '1';
        process.env.PASSWORD_MIN_PASSWORD_STRENGTH = '2';

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationOptions)],
          providers: [],
        }).compile();

        const config: AuthenticationOptionsInterface =
          moduleRef.get<AuthenticationOptionsInterface>(
            authenticationOptions.KEY,
          );

        expect(config).toMatchObject({
          maxPasswordAttempts: 1,
          minPasswordStrength: 2,
        });
      });

      it('configProcessNull', async () => {
        process.env.PASSWORD_MAX_PASSWORD_ATTEMPTS = 'test';
        process.env.PASSWORD_MIN_PASSWORD_STRENGTH = 'test';

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationOptions)],
          providers: [],
        }).compile();

        const config: AuthenticationOptionsInterface =
          moduleRef.get<AuthenticationOptionsInterface>(
            authenticationOptions.KEY,
          );

        expect(config).toMatchObject({
          maxPasswordAttempts: NaN,
          minPasswordStrength: NaN,
        });
      });

      it('configProcessNull', async () => {
        delete process.env.PASSWORD_MAX_PASSWORD_ATTEMPTS;
        delete process.env.PASSWORD_MIN_PASSWORD_STRENGTH;

        moduleRef = await Test.createTestingModule({
          imports: [ConfigModule.forFeature(authenticationOptions)],
          providers: [],
        }).compile();

        const config: AuthenticationOptionsInterface =
          moduleRef.get<AuthenticationOptionsInterface>(
            authenticationOptions.KEY,
          );

        expect(config).toMatchObject({
          maxPasswordAttempts: 3,
          minPasswordStrength: 8,
        });
      });
    });
  });
});
