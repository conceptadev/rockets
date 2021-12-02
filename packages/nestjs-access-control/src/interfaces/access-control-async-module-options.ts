import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { AccessControlOptions } from '..';

export interface AccessControlAsyncModuleOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<AccessControlOptions | Promise<AccessControlOptions>>,
      'useFactory' | 'inject'
    > {}
