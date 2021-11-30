import { Module, DynamicModule, Logger, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';
import { EmailConfigAsyncOptions } from './interfaces/email-config-async-options.interface';
// import { APP_EMAIL_MODULE_OPTIONS_TOKEN } from './email-constants';
import { emailConfig, EMAIL_MODULE_OPTIONS_TOKEN } from './config/email.config';

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
    return {
      module: EmailModule,
      imports: [MailerModule.forRoot(options.nodeMailer)],
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS_TOKEN,
          useValue: options ?? emailConfig(),
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
        EmailConfigModule.forRootAsync(options),
        MailerModule.forRootAsync({
          imports: [EmailConfigModule],
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

@Global()
@Module({})
export class EmailConfigModule {
  static forRoot(options: EmailConfigOptions): DynamicModule {
    return {
      module: EmailConfigModule,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [EMAIL_MODULE_OPTIONS_TOKEN],
    };
  }

  static forRootAsync(options: EmailConfigAsyncOptions): DynamicModule {
    return {
      module: EmailConfigModule,
      providers: [
        {
          provide: EMAIL_MODULE_OPTIONS_TOKEN,
          inject: options.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [EMAIL_MODULE_OPTIONS_TOKEN],
    };
  }
}
