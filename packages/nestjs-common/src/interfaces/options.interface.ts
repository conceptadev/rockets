import { DynamicModule } from '@nestjs/common';

export interface OptionsInterface
  extends Record<string, unknown>,
    Pick<DynamicModule, 'global' | 'imports'> {}
