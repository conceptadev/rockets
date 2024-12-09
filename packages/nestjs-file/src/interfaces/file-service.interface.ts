import { FileCreatableInterface, FileInterface } from '@concepta/nestjs-common';
import { ReferenceIdInterface } from '@concepta/nestjs-common';

export interface FileServiceInterface {
  push(file: FileCreatableInterface): Promise<FileInterface>;
  fetch(file: ReferenceIdInterface): Promise<FileInterface>;
}
