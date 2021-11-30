import { Module, DynamicModule, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';
import { EmailConfigAsyncOptions } from './interfaces/email-config-async-options.interface';
import { emailConfig, EMAIL_MODULE_OPTIONS_TOKEN } from './config/email.config';
import { EmailCoreModule } from './email-core.module';

@Module({})
export class EmailModule {
  /**
   * Register a pre-defined email transport
   *
   * @param {EmailConfigOptions} options A configurable options
   * definitions. See the structure of this object in the examples.
   * @returns {DynamicModule} Dynamic module.
   */
  public static forRoot(options?: EmailConfigOptions): DynamicModule {
    const defaultConfig = emailConfig();

    return {
      module: EmailModule,
      imports: [MailerModule.forRoot(defaultConfig.nodeMailer)],
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS_TOKEN,
          useValue: options ?? defaultConfig,
        },
        Logger,
        EmailService,
      ],
      exports: [EmailService],
    };
  }

  public static forRootAsync(options: EmailConfigAsyncOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        EmailCoreModule.forRootAsync(options),
        MailerModule.forRootAsync({
          imports: [EmailCoreModule],
          inject: [EMAIL_MODULE_OPTIONS_TOKEN],
          useFactory: async (config: EmailConfigOptions) => {
            return config.nodeMailer;
          },
        }),
      ],
      providers: [Logger, EmailService],
      exports: [EmailService],
    };
  }
}
