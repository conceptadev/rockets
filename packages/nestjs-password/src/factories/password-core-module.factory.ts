import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { PasswordCoreModule } from '../password-core.module';
import {
  passwordConfig,
  PASSWORD_MODULE_CONFIG_TOKEN,
} from '../config/password.config';
import {
  PasswordAsyncOptionsInterface,
  PasswordOptionsInterface,
} from '../interfaces/password-options.interface';

export class PasswordCoreModuleFactory
  implements ModuleFactoryInterface<PasswordAsyncOptionsInterface>
{
  forRoot(options: PasswordOptionsInterface) {
    return {
      module: PasswordCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: PASSWORD_MODULE_CONFIG_TOKEN,
          useValue: options || passwordConfig(),
        },
      ],
      exports: [PASSWORD_MODULE_CONFIG_TOKEN],
    };
  }

  forRootAsync(options: PasswordAsyncOptionsInterface) {
    return {
      module: PasswordCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: PASSWORD_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [PASSWORD_MODULE_CONFIG_TOKEN],
    };
  }
}
