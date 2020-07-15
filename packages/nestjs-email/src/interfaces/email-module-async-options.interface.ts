import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { EmailModuleOptions } from './email-module-options.interface';

export interface EmailModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<EmailModuleOptions | Promise<EmailModuleOptions>>,
      'useFactory' | 'inject'
    > {}
