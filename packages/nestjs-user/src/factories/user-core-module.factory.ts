import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';
import { USER_MODULE_OPTIONS_TOKEN, userOptions } from '../config/user.config';

import { UserCoreModule } from '../user-core.module';
import { UserOptionsInterface } from '../interfaces/user-options.interface';

export class UserCoreModuleFactory
  implements ModuleFactoryInterface<UserOptionsInterface>
{
  forRoot(config: ConfigInterface<UserOptionsInterface>) {
    return {
      module: UserCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: USER_MODULE_OPTIONS_TOKEN,
          useValue: config?.options || userOptions(),
        },
      ],
      exports: [USER_MODULE_OPTIONS_TOKEN],
    };
  }

  forRootAsync(config: ConfigAsyncInterface<UserOptionsInterface>) {
    return {
      module: UserCoreModule,
      imports: config?.imports,
      providers: [
        {
          provide: USER_MODULE_OPTIONS_TOKEN,
          inject: config?.inject,
          useFactory: config.useFactory,
        },
      ],
      exports: [USER_MODULE_OPTIONS_TOKEN],
    };
  }
}
