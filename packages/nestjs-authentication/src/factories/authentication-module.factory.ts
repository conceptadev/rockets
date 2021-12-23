import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { AuthenticationCoreModule } from '../authentication-core.module';
import { AuthenticationModule } from '../authentication.module';
import {
  AuthenticationAsyncOptionsInterface,
  AuthenticationOptionsInterface,
} from '../interfaces/authentication-options.interface';

export class AuthenticationModuleFactory
  implements ModuleFactoryInterface<AuthenticationOptionsInterface>
{
  forRoot(options: AuthenticationOptionsInterface) {
    return {
      module: AuthenticationModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        AuthenticationCoreModule.forRoot(options),
      ],
    };
  }

  forRootAsync(options: AuthenticationAsyncOptionsInterface) {
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
