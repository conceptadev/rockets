import { MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { EMAIL_MODULE_OPTIONS_TOKEN } from '../email.constants';
import { defaultMailerConfig } from './default-mailer.config';

describe('default mailer configuration', () => {
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

  describe('defaultMailerConfig()', () => {
    let moduleRef: TestingModule;

    it('should use fallbacks', async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forFeature(defaultMailerConfig)],
        providers: [],
      }).compile();

      const config: MailerOptions = moduleRef.get<MailerOptions>(
        defaultMailerConfig.KEY,
      );
      expect(config).toMatchObject<MailerOptions>({
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
      });
    });
  });
});
