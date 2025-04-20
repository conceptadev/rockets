import {
  ByIdInterface,
  FileCreatableInterface,
  ReferenceId,
} from '@concepta/nestjs-common';
import { CreateOneInterface } from '@concepta/nestjs-common';
import { FileEntityInterface } from './file-entity.interface';

export interface FileModelServiceInterface
  extends ByIdInterface<ReferenceId, FileEntityInterface>,
    CreateOneInterface<FileCreatableInterface, FileEntityInterface> {
  getUniqueFile(
    org: Pick<FileCreatableInterface, 'serviceKey' | 'fileName'>,
  ): Promise<FileEntityInterface | null>;
}
