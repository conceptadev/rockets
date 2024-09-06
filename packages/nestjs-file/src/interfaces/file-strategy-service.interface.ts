import { FileInterface } from '@concepta/ts-common';
import { FileStorageServiceInterface } from './file-storage-service.interface';

export interface FileStrategyServiceInterface {
  getUploadUrl(file: FileInterface): Promise<string>;
  getDownloadUrl(file: FileInterface): Promise<string>;
  resolveStorageService(file: FileInterface): FileStorageServiceInterface;
}
