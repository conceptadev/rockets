import { FileCreatableInterface, FileInterface } from '@concepta/ts-common';
import { ReferenceIdInterface } from '@concepta/ts-core';

export interface FileServiceInterface {
  push(file: FileCreatableInterface): Promise<FileInterface>;
  fetch(file: ReferenceIdInterface): Promise<FileInterface>;
}
