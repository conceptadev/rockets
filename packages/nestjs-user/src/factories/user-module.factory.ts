import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { UserCoreModule } from '../user-core.module';
import { UserModule } from '../user.module';
import {
  UserAsyncOptionsInterface,
  UserOptionsInterface,
} from '../interfaces/user-options.interface';
import { UserService } from '../services/user.service';
import { UserLookupService } from '../services/user-lookup.service';

export class UserModuleFactory
  implements ModuleFactoryInterface<UserOptionsInterface>
{
  forRoot(options: UserOptionsInterface) {
    return {
      module: UserModule,
      global: options?.global ?? false,
      imports: [...(options?.imports ?? []), UserCoreModule.forRoot(options)],
      providers: [UserService, UserLookupService],
      exports: [UserService, UserLookupService],
    };
  }

  forRootAsync(options: UserAsyncOptionsInterface) {
    return {
      module: UserModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        UserCoreModule.forRootAsync(options),
      ],
      providers: [UserService, UserLookupService],
      exports: [UserService, UserLookupService],
    };
  }
}
