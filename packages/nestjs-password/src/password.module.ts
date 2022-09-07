import { DynamicModule, Module } from '@nestjs/common';

import {
  PasswordAsyncOptions,
  PasswordModuleClass,
  PasswordOptions,
  createPasswordImports,
  createPasswordProviders,
  createPasswordExports,
} from './password.module-definition';

import { PasswordCreationService } from './services/password-creation.service';
import { PasswordStorageService } from './services/password-storage.service';
import { PasswordStrengthService } from './services/password-strength.service';

@Module({
  providers: [
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
  ],
  exports: [
    PasswordCreationService,
    PasswordStrengthService,
    PasswordStorageService,
  ],
})
export class PasswordModule extends PasswordModuleClass {
  static register(options: PasswordOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: PasswordAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: PasswordOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: PasswordAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: PasswordOptions): DynamicModule {
    return {
      module: PasswordModule,
      imports: createPasswordImports(),
      providers: createPasswordProviders({ options }),
      exports: createPasswordExports(),
    };
  }
}
