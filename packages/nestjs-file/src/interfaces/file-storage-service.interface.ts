import { FileInterface } from '@concepta/ts-common';
import { StorageServiceInterface } from './storage-service.interface';

export interface FileStorageServiceInterface {
  getUploadUrl(file: FileInterface): Promise<string>;
  getDownloadUrl(file: FileInterface): Promise<string>;
  resolveStorageService(file: FileInterface): StorageServiceInterface;
}
