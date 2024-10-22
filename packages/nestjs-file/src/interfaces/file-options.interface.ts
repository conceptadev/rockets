import { FileSettingsInterface } from './file-settings.interface';
import { FileStorageServiceInterface } from './file-storage-service.interface';

export interface FileOptionsInterface {
  storageServices?: FileStorageServiceInterface[];
  settings?: FileSettingsInterface;
}
