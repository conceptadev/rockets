import { FileInterface } from '@concepta/ts-common';

export interface FileServiceInterface {
  push(file: Omit<FileInterface, 'id'>): Promise<FileInterface>;
  fetch(file: Omit<FileInterface, 'serviceKey'>): Promise<FileInterface>;
}
