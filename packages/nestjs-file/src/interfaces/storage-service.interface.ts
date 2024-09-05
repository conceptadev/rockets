import { FileCreatableInterface } from '@concepta/ts-common';

export interface StorageServiceInterface {
  KEY: string;
  uploadTimeout: number;
  getUploadUrl(file: FileCreatableInterface): Promise<string> | string;
  getDownloadUrl(file: FileCreatableInterface): Promise<string> | string;
}
