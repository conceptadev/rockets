import { DynamicModule, Module } from '@nestjs/common';

import {
  UserAsyncOptions,
  UserModuleClass,
  UserOptions,
  createUserImports,
  createUserProviders,
  createUserExports,
  createUserControllers,
} from './user.module-definition';
import { UserMissingEntitiesOptionsException } from './exceptions/user-missing-entities-options.exception';

/**
 * User Module
 */
@Module({})
export class UserModule extends UserModuleClass {
  static register(options: UserOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: UserAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: UserOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: UserAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature(options: UserOptions): DynamicModule {
    const { entities } = options;

    if (!entities) {
      throw new UserMissingEntitiesOptionsException();
    }

    return {
      module: UserModule,
      imports: createUserImports({ entities }),
      providers: createUserProviders({ overrides: options }),
      exports: createUserExports(),
      controllers: createUserControllers(options),
    };
  }
}
