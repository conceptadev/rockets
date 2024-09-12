import { ReferenceId } from '@concepta/ts-core';
import { FileInterface } from './file.interface';

export interface FileOwnableInterface {
  // TODO: should i have this as ReferenceId or null?
  fileId: ReferenceId | null;
  file?: FileInterface;
}
