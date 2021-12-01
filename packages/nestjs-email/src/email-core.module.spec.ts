import { ConfigModule, ConfigType } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { emailConfig } from './config/email.config';
import { EmailCoreModule } from './email-core.module';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';

describe('EmailModule', () => {
  const plainEmailConfig: EmailConfigOptions = {
    nodeMailer: {
      transport: {
        host: 'smtp.foo.org',
        port: 587,
        auth: {
          user: '',
          pass: '',
        },
      },
    },
  };

  describe('forRoot (plain config)', () => {
    it('should import the dynamic module synchronously', async () => {
      await Test.createTestingModule({
        imports: [EmailCoreModule.forRoot(plainEmailConfig)],
      }).compile();
    });
  });

  describe('forRoot (default config)', () => {
    it('should import the dynamic module synchronously', async () => {
      const config = await emailConfig();

      await Test.createTestingModule({
        imports: [EmailCoreModule.forRoot(config)],
      }).compile();
    });
  });

  describe('forRootAsync (plain)', () => {
    it('should import the dynamic module asynchronously', async () => {
      await Test.createTestingModule({
        imports: [
          EmailCoreModule.forRootAsync({
            useFactory: async () => {
              return plainEmailConfig;
            },
          }),
        ],
      }).compile();
    });
  });

  describe('forRootAsync (default)', () => {
    it('should import the dynamic module asynchronously', async () => {
      await Test.createTestingModule({
        imports: [
          EmailCoreModule.forRootAsync({
            imports: [ConfigModule.forFeature(emailConfig)],
            inject: [emailConfig.KEY],
            useFactory: async (config: ConfigType<typeof emailConfig>) => {
              return config;
            },
          }),
        ],
      }).compile();
    });
  });
});
