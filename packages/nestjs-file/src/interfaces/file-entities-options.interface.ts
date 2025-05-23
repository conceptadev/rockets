import { FILE_MODULE_FILE_ENTITY_KEY } from '../file.constants';
import {
  FileEntityInterface,
  RepositoryEntityOptionInterface,
} from '@concepta/nestjs-common';

export interface FileEntitiesOptionsInterface {
  [FILE_MODULE_FILE_ENTITY_KEY]: RepositoryEntityOptionInterface<FileEntityInterface>;
}
