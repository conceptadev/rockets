import { FileCreatableInterface } from '@concepta/ts-common';
import { FileStrategyServiceInterface } from '../interfaces/file-strategy-service.interface';
import { FileStorageServiceInterface } from '../interfaces/file-storage-service.interface';
import { FileStorageServiceNotFoundException } from '../exceptions/file-storage-service-not-found.exception';

export class FileStrategyService implements FileStrategyServiceInterface {
  private readonly storageServices: FileStorageServiceInterface[] = [];

  public addStorageService(storageService: FileStorageServiceInterface): void {
    this.storageServices.push(storageService);
  }

  async getUploadUrl(file: FileCreatableInterface): Promise<string> {
    return this.resolveStorageService(file).getUploadUrl(file);
  }

  async getDownloadUrl(file: FileCreatableInterface): Promise<string> {
    return this.resolveStorageService(file).getDownloadUrl(file);
  }

  resolveStorageService(
    file: FileCreatableInterface,
  ): FileStorageServiceInterface {
    const storageService = this.storageServices.find((storageService) => {
      return storageService.KEY === file.serviceKey;
    });

    if (storageService) {
      return storageService;
    }

    throw new FileStorageServiceNotFoundException(file.serviceKey);
  }
}
