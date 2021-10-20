import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { authenticationConfig, AuthenticationConfigFactory, AUTHENTICATION_MODULE_CONFIG } from './authentication.config';

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
      expect(AUTHENTICATION_MODULE_CONFIG).toEqual('AUTHENTICATION_MODULE_CONFIG');
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

    

    describe('authentication', () => {
      it('authentication', async () => {
        const config = await authenticationConfig();

        expect(config.maxPasswordAttempts).toBe(3);
        expect(config.minPasswordStrength).toBe(8);
      });
    });
  });
});
