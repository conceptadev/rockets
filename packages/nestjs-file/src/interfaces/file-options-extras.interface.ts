import { DynamicModule } from '@nestjs/common';
import { FileEntitiesOptionsInterface } from './file-entities-options.interface';

export interface FileOptionsExtrasInterface
  extends Pick<DynamicModule, 'global'>,
    Partial<FileEntitiesOptionsInterface> {}
