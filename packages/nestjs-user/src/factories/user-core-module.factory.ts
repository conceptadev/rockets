import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { UserCoreModule } from '../user-core.module';
import { userConfig, USER_MODULE_CONFIG_TOKEN } from '../config/user.config';
import {
  UserAsyncOptionsInterface,
  UserOptionsInterface,
} from '../interfaces/user-options.interface';

export class UserCoreModuleFactory
  implements ModuleFactoryInterface<UserAsyncOptionsInterface>
{
  forRoot(options: UserOptionsInterface) {
    return {
      module: UserCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: USER_MODULE_CONFIG_TOKEN,
          useValue: options || userConfig(),
        },
      ],
      exports: [USER_MODULE_CONFIG_TOKEN],
    };
  }

  forRootAsync(options: UserAsyncOptionsInterface) {
    return {
      module: UserCoreModule,
      imports: options?.imports,
      providers: [
        {
          provide: USER_MODULE_CONFIG_TOKEN,
          inject: options?.inject,
          useFactory: options.useFactory,
        },
      ],
      exports: [USER_MODULE_CONFIG_TOKEN],
    };
  }
}
