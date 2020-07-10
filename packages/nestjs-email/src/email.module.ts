import { Module, DynamicModule, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailService } from './email.service';
import { EmailModuleOptions } from './interfaces';
import { EmailModuleAsyncOptions } from './interfaces';

@Module({})
export class EmailModule {
  /**
   * Register a pre-defined email transport
   * @param {EmailModuleOptions} options  A configurable options
   * definitions. See the structure of this object in the examples.
   */
  public static forRoot(options: EmailModuleOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [MailerModule.forRoot(options.nodeMailer)],
      providers: [Logger, EmailService],
      exports: [EmailService],
    };
  }

  public static forRootAsync(options: EmailModuleAsyncOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: [MailerModule.forRootAsync(options.nodeMailer)],
      providers: [Logger, EmailService],
      exports: [EmailService],
    };
  }
}
