import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { AuthenticationCoreModule } from '../authentication-core.module';
import {
  authenticationConfig,
  AUTHENTICATION_MODULE_CONFIG_TOKEN,
} from '../config/authentication.config';
import {
  AuthenticationAsyncOptionsInterface,
  AuthenticationOptionsInterface,
} from '../interfaces/authentication-options.interface';

export class AuthenticationCoreModuleFactory
  implements ModuleFactoryInterface<AuthenticationAsyncOptionsInterface>
{
  forRoot(options: AuthenticationOptionsInterface) {
    return {
      module: AuthenticationCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          useValue: options || authenticationConfig(),
        },
      ],
      exports: [AUTHENTICATION_MODULE_CONFIG_TOKEN],
    };
  }

  forRootAsync(options: AuthenticationAsyncOptionsInterface) {
    return {
      module: AuthenticationCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [AUTHENTICATION_MODULE_CONFIG_TOKEN],
    };
  }
}
