import { FileInterface } from '@concepta/ts-common';
import { StorageServiceInterface } from '../interfaces/storage-service.interface';
import {
  AWS_KEY_FIXTURE,
  DOWNLOAD_URL_FIXTURE,
  UPLOAD_URL_FIXTURE,
} from './constants.fixture';

export class AwsStorageService implements StorageServiceInterface {
  KEY: string = AWS_KEY_FIXTURE;

  uploadTimeout: number = 5000;

  getUploadUrl(_file: FileInterface): string {
    return UPLOAD_URL_FIXTURE;
  }

  getDownloadUrl(_file: FileInterface): string {
    // make a call to aws to get signed download url
    return DOWNLOAD_URL_FIXTURE;
  }
}
