import { Module, Logger } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailOptionsInterface } from './interfaces/email-options.interface';

import {
  AsyncModuleConfig,
  createConfigurableDynamicRootModule,
  deferExternal,
  DeferExternalOptionsInterface,
} from '@concepta/nestjs-core';
import {
  EMAIL_MODULE_MAILER_SERVICE_TOKEN,
  EMAIL_MODULE_OPTIONS_TOKEN,
} from './email.constants';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { defaultMailerConfig } from './config/default-mailer.config';

@Module({
  providers: [Logger, EmailService],
  exports: [EmailService],
})
export class EmailModule extends createConfigurableDynamicRootModule<
  EmailModule,
  EmailOptionsInterface
>(EMAIL_MODULE_OPTIONS_TOKEN, {
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule.forFeature(defaultMailerConfig)],
      inject: [defaultMailerConfig.KEY],
      useFactory: async (config: ConfigType<typeof defaultMailerConfig>) =>
        config,
    }),
  ],
  providers: [
    {
      provide: EMAIL_MODULE_MAILER_SERVICE_TOKEN,
      inject: [EMAIL_MODULE_OPTIONS_TOKEN, MailerService],
      useFactory: async (
        options: EmailOptionsInterface,
        defaultService: MailerService,
      ) => options.mailerService ?? defaultService,
    },
  ],
  exports: [EMAIL_MODULE_MAILER_SERVICE_TOKEN],
}) {
  static register(options: EmailOptionsInterface) {
    return EmailModule.forRoot(EmailModule, options);
  }

  static registerAsync(options: AsyncModuleConfig<EmailOptionsInterface>) {
    return EmailModule.forRootAsync(EmailModule, {
      useFactory: () => ({}),
      ...options,
    });
  }

  static deferred(options: DeferExternalOptionsInterface = {}) {
    return deferExternal<EmailModule, EmailOptionsInterface>(
      EmailModule,
      options,
    );
  }
}
