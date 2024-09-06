import { FileCreatableInterface } from '@concepta/ts-common';

export interface FileStorageServiceInterface {
  KEY: string;
  getUploadUrl(file: FileCreatableInterface): Promise<string> | string;
  getDownloadUrl(file: FileCreatableInterface): Promise<string> | string;
}
