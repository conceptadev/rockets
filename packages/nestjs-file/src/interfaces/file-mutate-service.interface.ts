import { FileCreatableInterface } from '@concepta/ts-common';
import { CreateOneInterface } from '@concepta/ts-core';
import { FileEntityInterface } from './file-entity.interface';

export interface FileMutateServiceInterface
  extends CreateOneInterface<FileCreatableInterface, FileEntityInterface> {}
