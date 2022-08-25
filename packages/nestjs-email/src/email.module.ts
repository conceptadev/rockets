import { DynamicModule, Logger, Module } from '@nestjs/common';

import {
  EmailAsyncOptions,
  EmailModuleClass,
  EmailOptions,
  createEmailImports,
  createEmailProviders,
  createEmailExports,
} from './email.module-definition';

import { EmailService } from './email.service';

/**
 * Email module
 */
@Module({
  providers: [Logger, EmailService],
  exports: [EmailService],
})
export class EmailModule extends EmailModuleClass {
  static register(options: EmailOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: EmailAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: EmailOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: EmailAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: EmailOptions): DynamicModule {
    return {
      module: EmailModule,
      imports: createEmailImports(),
      providers: createEmailProviders({ overrides: options }),
      exports: createEmailExports(),
    };
  }
}
