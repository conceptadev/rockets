import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { AccessControlOptions } from '..';

export interface AccessControlAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<AccessControlOptions | Promise<AccessControlOptions>>,
      'useFactory' | 'inject'
    > {}
