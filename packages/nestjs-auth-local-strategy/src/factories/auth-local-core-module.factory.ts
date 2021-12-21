import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { AuthLocalCoreModule } from '../auth-local-core.module';
import {
  authLocalConfig,
  AUTH_LOCAL_MODULE_CONFIG_TOKEN,
} from '../config/auth-local.config';
import {
  AuthLocalAsyncOptionsInterface,
  AuthLocalOptionsInterface,
} from '../interfaces/auth-local-options.interface';

export class AuthLocalCoreModuleFactory
  implements ModuleFactoryInterface<AuthLocalAsyncOptionsInterface>
{
  forRoot(options: AuthLocalOptionsInterface) {
    return {
      module: AuthLocalCoreModule,
      providers: [
        {
          provide: AUTH_LOCAL_MODULE_CONFIG_TOKEN,
          useValue: options || authLocalConfig(),
        },
      ],
      exports: [AUTH_LOCAL_MODULE_CONFIG_TOKEN],
    };
  }

  forRootAsync(options: AuthLocalAsyncOptionsInterface) {
    return {
      module: AuthLocalCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTH_LOCAL_MODULE_CONFIG_TOKEN,
          imports: options?.imports,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [AUTH_LOCAL_MODULE_CONFIG_TOKEN],
    };
  }
}
