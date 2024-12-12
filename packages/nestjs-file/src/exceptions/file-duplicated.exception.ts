import { HttpStatus } from '@nestjs/common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { FileException } from './file.exception';

export class FileDuplicateEntryException extends FileException {
  context: RuntimeException['context'] & {
    serviceKey: string;
    fileName: string;
  };

  constructor(
    serviceKey: string,
    fileName: string,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'Duplicate entry detected for service %s with file %s',
      messageParams: [serviceKey, fileName],
      httpStatus: HttpStatus.CONFLICT,
      ...options,
    });

    this.errorCode = 'FILE_DUPLICATE_ENTRY_ERROR';

    this.context = {
      ...super.context,
      serviceKey,
      fileName,
    };
  }
}
