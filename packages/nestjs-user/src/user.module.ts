import { DynamicModule, Module } from '@nestjs/common';
import { PasswordStorageService } from '@concepta/nestjs-password';

import {
  UserAsyncOptions,
  UserModuleClass,
  UserOptions,
  createUserImports,
  createUserProviders,
  createUserExports,
  createUserControllers,
} from './user.module-definition';

import { UserController } from './user.controller';
import { UserLookupService } from './services/user-lookup.service';
import { UserCrudService } from './services/user-crud.service';
import { UserMutateService } from './services/user-mutate.service';

/**
 * User Module
 */
@Module({
  providers: [
    UserLookupService,
    UserMutateService,
    UserCrudService,
    PasswordStorageService,
  ],
  exports: [UserLookupService, UserMutateService, UserCrudService],
  controllers: [UserController],
})
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
      throw new Error('You must provide the entities option');
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
