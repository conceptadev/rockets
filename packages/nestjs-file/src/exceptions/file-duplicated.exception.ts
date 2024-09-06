import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileDuplicateEntryException extends RuntimeException {
  context: RuntimeException['context'] & {
    serviceKey: string;
    fileName: string;
  };

  constructor(
    serviceKey: string,
    fileName: string,
    originalError?: unknown,
    message = 'Duplicate entry detected for service %s with file %s',
  ) {
    super({
      message,
      messageParams: [serviceKey, fileName],
      httpStatus: HttpStatus.CONFLICT,
      originalError,
    });

    this.errorCode = 'FILE_DUPLICATE_ENTRY_ERROR';

    this.context = {
      ...super.context,
      serviceKey,
      fileName,
    };
  }
}
