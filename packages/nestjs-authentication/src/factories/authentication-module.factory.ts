import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { AuthenticationCoreModule } from '../authentication-core.module';
import { AuthenticationModule } from '../authentication.module';
import {
  AuthenticationAsyncOptionsInterface,
  AuthenticationOptionsInterface,
} from '../interfaces/authentication-options.interface';
import { PasswordCreationService } from '../services/password-creation.service';
import { PasswordStorageService } from '../services/password-storage.service';
import { PasswordStrengthService } from '../services/password-strength.service';

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
      providers: [
        PasswordCreationService,
        PasswordStrengthService,
        PasswordStorageService,
      ],
      exports: [
        PasswordCreationService,
        PasswordStrengthService,
        PasswordStorageService,
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
      providers: [
        PasswordCreationService,
        PasswordStrengthService,
        PasswordStorageService,
      ],
      exports: [
        PasswordCreationService,
        PasswordStrengthService,
        PasswordStorageService,
      ],
    };
  }
}
