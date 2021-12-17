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
      imports: [AuthenticationCoreModule.forRoot(options)],
    };
  }

  forRootAsync(options: AuthenticationAsyncOptionsInterface) {
    return {
      module: AuthenticationModule,
      imports: [AuthenticationCoreModule.forRootAsync(options)],
    };
  }
}
