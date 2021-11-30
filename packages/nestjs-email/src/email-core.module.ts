import { Module, DynamicModule, Global } from '@nestjs/common';
import { EmailConfigOptions } from './interfaces/email-config-options.interface';
import { EmailConfigAsyncOptions } from './interfaces/email-config-async-options.interface';
import { EMAIL_MODULE_OPTIONS_TOKEN } from './config/email.config';

@Global()
@Module({})
export class EmailCoreModule {
  static forRoot(options: EmailConfigOptions): DynamicModule {
    return {
      module: EmailCoreModule,
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
      module: EmailCoreModule,
      imports: options.imports,
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
