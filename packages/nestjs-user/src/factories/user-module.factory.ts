import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { UserCoreModule } from '../user-core.module';
import { UserLookupService } from '../services/user-lookup.service';
import { UserModule } from '../user.module';
import { UserOptionsInterface } from '../interfaces/user-options.interface';
import { UserService } from '../services/user.service';

export class UserModuleFactory
  implements ModuleFactoryInterface<UserOptionsInterface>
{
  forRoot(config: ConfigInterface<UserOptionsInterface>) {
    return {
      module: UserModule,
      global: config?.global ?? false,
      imports: [...(config?.imports ?? []), UserCoreModule.forRoot(config)],
      providers: [UserService, UserLookupService],
      exports: [UserService, UserLookupService],
    };
  }

  forRootAsync(config: ConfigAsyncInterface<UserOptionsInterface>) {
    return {
      module: UserModule,
      global: config?.global ?? false,
      imports: [
        ...(config?.imports ?? []),
        UserCoreModule.forRootAsync(config),
      ],
      providers: [UserService, UserLookupService],
      exports: [UserService, UserLookupService],
    };
  }
}
