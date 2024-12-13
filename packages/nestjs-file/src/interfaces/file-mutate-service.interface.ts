import { FileCreatableInterface } from '@concepta/nestjs-common';
import { CreateOneInterface } from '@concepta/nestjs-common';
import { FileEntityInterface } from './file-entity.interface';

export interface FileMutateServiceInterface
  extends CreateOneInterface<FileCreatableInterface, FileEntityInterface> {}
