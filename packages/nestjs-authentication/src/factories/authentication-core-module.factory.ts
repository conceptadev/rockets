import {
  AUTHENTICATION_MODULE_OPTIONS_TOKEN,
  authenticationOptions,
} from '../config/authentication.config';
import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { AuthenticationCoreModule } from '../authentication-core.module';
import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';

export class AuthenticationCoreModuleFactory
  implements ModuleFactoryInterface<AuthenticationOptionsInterface>
{
  forRoot(config: ConfigInterface<AuthenticationOptionsInterface>) {
    return {
      module: AuthenticationCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_OPTIONS_TOKEN,
          useValue: config?.options || authenticationOptions(),
        },
      ],
      exports: [AUTHENTICATION_MODULE_OPTIONS_TOKEN],
    };
  }

  forRootAsync(options: ConfigAsyncInterface<AuthenticationOptionsInterface>) {
    return {
      module: AuthenticationCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: AUTHENTICATION_MODULE_OPTIONS_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [AUTHENTICATION_MODULE_OPTIONS_TOKEN],
    };
  }
}
