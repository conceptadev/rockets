import { Module, DynamicModule, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';
import { EmailConfigAsyncOptions } from './interfaces/email-config-async-options.interface';
import {
  defaultEmailConfig,
  EMAIL_MODULE_OPTIONS_TOKEN,
} from './config/email.config';
import { EmailCoreModule } from './email-core.module';

@Module({
  imports: [
    EmailCoreModule.forRoot(defaultEmailConfig),
    MailerModule.forRoot(defaultEmailConfig.nodeMailer),
  ],
  providers: [Logger, EmailService],
  exports: [EmailService],
})
export class EmailModule {
  /**
   * Register a pre-defined email transport
   *
   * @param {EmailConfigOptions} options A configurable options
   * definitions. See the structure of this object in the examples.
   * @returns {DynamicModule} Dynamic module.
   */
  public static forRoot(options: EmailConfigOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        EmailCoreModule.forRoot(options),
        MailerModule.forRoot(options.nodeMailer),
      ],
    };
  }

  public static forRootAsync(options: EmailConfigAsyncOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [
        EmailCoreModule.forRootAsync(options),
        MailerModule.forRootAsync({
          inject: [EMAIL_MODULE_OPTIONS_TOKEN],
          useFactory: async (config: EmailConfigOptions) => {
            return config.nodeMailer;
          },
        }),
      ],
    };
  }
}
