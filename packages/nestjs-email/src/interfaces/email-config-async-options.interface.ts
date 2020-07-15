import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { EmailConfigOptions } from './email-config-options.interface';

export interface EmailConfigAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<EmailConfigOptions | Promise<EmailConfigOptions>>,
      'useFactory' | 'inject'
    > {}
