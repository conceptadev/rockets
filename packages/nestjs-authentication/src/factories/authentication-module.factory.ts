import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { AuthenticationCoreModule } from '../authentication-core.module';
import { AuthenticationModule } from '../authentication.module';
import { AuthenticationOptionsInterface } from '../interfaces/authentication-options.interface';

export class AuthenticationModuleFactory
  implements ModuleFactoryInterface<AuthenticationOptionsInterface>
{
  forRoot(config: ConfigInterface<AuthenticationOptionsInterface>) {
    return {
      module: AuthenticationModule,
      global: config?.global ?? false,
      imports: [
        ...(config?.imports ?? []),
        AuthenticationCoreModule.forRoot(config),
      ],
    };
  }

  forRootAsync(options: ConfigAsyncInterface<AuthenticationOptionsInterface>) {
    return {
      module: AuthenticationModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        AuthenticationCoreModule.forRootAsync(options),
      ],
    };
  }
}
