import {
  ConfigAsyncInterface,
  ConfigInterface,
  ModuleFactoryInterface,
} from '@rockts-org/nestjs-common';

import { PasswordCoreModule } from '../password-core.module';
import { PasswordCreationService } from '../services/password-creation.service';
import { PasswordModule } from '../password.module';
import { PasswordOptionsInterface } from '../interfaces/password-options.interface';
import { PasswordStorageService } from '../services/password-storage.service';
import { PasswordStrengthService } from '../services/password-strength.service';

export class PasswordModuleFactory
  implements ModuleFactoryInterface<PasswordOptionsInterface>
{
  forRoot(config: ConfigInterface<PasswordOptionsInterface>) {
    return {
      module: PasswordModule,
      global: config?.global ?? false,
      imports: [...(config?.imports ?? []), PasswordCoreModule.forRoot(config)],
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

  forRootAsync(options: ConfigAsyncInterface<PasswordOptionsInterface>) {
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
