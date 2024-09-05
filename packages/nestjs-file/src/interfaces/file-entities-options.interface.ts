import { TypeOrmExtEntityOptionInterface } from '@concepta/nestjs-typeorm-ext';

import { FILE_MODULE_FILE_ENTITY_KEY } from '../file.constants';
import { FileEntityInterface } from './file-entity.interface';

export interface FileEntitiesOptionsInterface {
  entities: {
    [FILE_MODULE_FILE_ENTITY_KEY]: TypeOrmExtEntityOptionInterface<FileEntityInterface>;
  };
}
