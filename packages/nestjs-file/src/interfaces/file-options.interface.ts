import { FileSettingsInterface } from './file-settings.interface';
import { StorageServiceInterface } from './storage-service.interface';

export interface FileOptionsInterface {
  storageServices?: StorageServiceInterface[];
  settings?: FileSettingsInterface;
}
