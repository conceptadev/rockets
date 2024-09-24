import { FileCreatableInterface } from '@concepta/ts-common';
import { FileStorageServiceInterface } from './file-storage-service.interface';

export interface FileStrategyServiceInterface {
  getUploadUrl(file: FileCreatableInterface): Promise<string>;
  getDownloadUrl(file: FileCreatableInterface): Promise<string>;
  resolveStorageService(
    file: FileCreatableInterface,
  ): FileStorageServiceInterface;
}
