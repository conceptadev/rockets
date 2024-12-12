import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { HttpStatus } from '@nestjs/common';
import { FileException } from './file.exception';

export class FileStorageServiceNotFoundException extends FileException {
  context: RuntimeException['context'] & {
    storageServiceName: string;
  };

  constructor(assignmentName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Storage Service %s was not registered to be used.',
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
      ...options,
    });

    this.errorCode = 'FILE_STORAGE_SERVICE_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      storageServiceName: assignmentName,
    };
  }
}
