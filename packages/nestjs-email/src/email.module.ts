import { Module, DynamicModule, Logger, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces';
import { EmailConfigAsyncOptions } from './interfaces';
import { EMAIL_MODULE_OPTIONS_TOKEN } from './email-constants';

@Module({})
export class EmailModule {
  /**
   * Register a pre-defined email transport
   * @param {EmailConfigOptions} options  A configurable options
   * definitions. See the structure of this object in the examples.
   */
  public static forRoot(options: EmailConfigOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        EmailConfigModule.forRoot(options),
        MailerModule.forRoot(options.nodeMailer),
      ],
      providers: [Logger, EmailService],
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
