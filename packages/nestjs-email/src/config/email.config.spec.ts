import { ConfigModule } from '@nestjs/config';
// import { LoggerOptionsInterface } from '../interfaces/logger-options.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailConfigOptions } from '..';
import { emailConfig, EMAIL_MODULE_OPTIONS_TOKEN } from './email.config';

describe('email configuration', () => {
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
      expect(EMAIL_MODULE_OPTIONS_TOKEN).toEqual('EMAIL_MODULE_OPTIONS_TOKEN');
    });
  });

  describe('emailConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(emailConfig)],
        providers: [],
      }).compile();

      const config: EmailConfigOptions = moduleRef.get<EmailConfigOptions>(
        emailConfig.KEY,
      );
      expect(config).toMatchObject({
        nodeMailer: {
          transport: {
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          },
          defaults: {
            from: process.env.EMAIL_FROM,
          },
        },
      });
    });
  });
});
