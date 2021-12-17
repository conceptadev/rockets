import { ModuleMetadata } from '@nestjs/common';

export interface OptionsInterface
  extends Record<string, unknown>,
    Pick<ModuleMetadata, 'imports'> {}
