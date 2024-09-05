import { FileCreatableInterface } from '@concepta/ts-common';
import { FileStorageServiceInterface } from '../interfaces/file-storage-service.interface';
import { StorageServiceInterface } from '../interfaces/storage-service.interface';
import { FileStorageServiceNotFoundException } from '../exceptions/file-storage-service-not-found.exception';

// Classe FileStorageService
export class FileStorageService implements FileStorageServiceInterface {
  private readonly storageServices: StorageServiceInterface[] = [];

  public addStorageService(storageService: StorageServiceInterface): void {
    this.storageServices.push(storageService);
  }

  async getUploadUrl(file: FileCreatableInterface): Promise<string> {
    return this.resolveStorageService(file).getUploadUrl(file);
  }

  async getDownloadUrl(file: FileCreatableInterface): Promise<string> {
    return this.resolveStorageService(file).getDownloadUrl(file);
  }

  resolveStorageService(file: FileCreatableInterface): StorageServiceInterface {
    const storageService = this.storageServices.find((storageService) => {
      return storageService.KEY === file.serviceKey;
    });
    if (!storageService)
      throw new FileStorageServiceNotFoundException(file.serviceKey);
    return storageService;
  }
}
