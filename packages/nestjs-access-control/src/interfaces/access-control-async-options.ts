import { FactoryProvider, ModuleMetadata } from '@nestjs/common/interfaces';
import { AccessControlMetadataInterface } from './access-control-metadata.interface';

export interface AccessControlAsyncOptions
  extends Pick<ModuleMetadata, 'imports'>,
    Pick<
      FactoryProvider<
        AccessControlMetadataInterface | Promise<AccessControlMetadataInterface>
      >,
      'useFactory' | 'inject'
    > {}
