import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';
import {
  PASSWORD_MODULE_OPTIONS_TOKEN,
  passwordOptions,
} from '../config/password.config';

import { PasswordCoreModule } from '../password-core.module';
import { PasswordOptionsInterface } from '../interfaces/password-options.interface';

export class PasswordCoreModuleFactory
  implements ModuleFactoryInterface<PasswordOptionsInterface>
{
  forRoot(config: ConfigInterface<PasswordOptionsInterface>) {
    return {
      module: PasswordCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: PASSWORD_MODULE_OPTIONS_TOKEN,
          useValue: config?.options || passwordOptions(),
        },
      ],
      exports: [PASSWORD_MODULE_OPTIONS_TOKEN],
    };
  }

  forRootAsync(options: ConfigAsyncInterface<PasswordOptionsInterface>) {
    return {
      module: PasswordCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: PASSWORD_MODULE_OPTIONS_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [PASSWORD_MODULE_OPTIONS_TOKEN],
    };
  }
}
