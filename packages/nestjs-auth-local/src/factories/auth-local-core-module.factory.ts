import {
  AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
  authLocalOptions,
} from '../config/auth-local.config';
import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { AuthLocalCoreModule } from '../auth-local-core.module';
import { AuthLocalOptionsInterface } from '../interfaces/auth-local-options.interface';

export class AuthLocalCoreModuleFactory
  implements ModuleFactoryInterface<AuthLocalOptionsInterface>
{
  forRoot(config: ConfigInterface<AuthLocalOptionsInterface>) {
    return {
      module: AuthLocalCoreModule,
      providers: [
        {
          provide: AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
          useValue: config?.options || authLocalOptions(),
        },
      ],
      exports: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN],
    };
  }

  forRootAsync(config: ConfigAsyncInterface<AuthLocalOptionsInterface>) {
    return {
      module: AuthLocalCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: AUTH_LOCAL_MODULE_OPTIONS_TOKEN,
          imports: config?.imports,
          inject: config?.inject,
          useFactory: config.useFactory,
        },
      ],
      exports: [AUTH_LOCAL_MODULE_OPTIONS_TOKEN],
    };
  }
}
