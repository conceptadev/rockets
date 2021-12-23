import { ModuleFactoryInterface } from '@rockts-org/nestjs-common';
import { PasswordCoreModule } from '../password-core.module';
import { PasswordModule } from '../password.module';
import {
  PasswordAsyncOptionsInterface,
  PasswordOptionsInterface,
} from '../interfaces/password-options.interface';
import { PasswordCreationService } from '../services/password-creation.service';
import { PasswordStorageService } from '../services/password-storage.service';
import { PasswordStrengthService } from '../services/password-strength.service';

export class PasswordModuleFactory
  implements ModuleFactoryInterface<PasswordOptionsInterface>
{
  forRoot(options: PasswordOptionsInterface) {
    return {
      module: PasswordModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        PasswordCoreModule.forRoot(options),
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

  forRootAsync(options: PasswordAsyncOptionsInterface) {
    return {
      module: PasswordModule,
      global: options?.global ?? false,
      imports: [
        ...(options?.imports ?? []),
        PasswordCoreModule.forRootAsync(options),
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
