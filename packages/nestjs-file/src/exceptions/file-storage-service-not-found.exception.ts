import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class FileStorageServiceNotFoundException extends RuntimeException {
  context: RuntimeException['context'] & {
    storageServiceName: string;
  };

  constructor(
    assignmentName: string,
    message = 'Storage Service %s was not registered to be used.',
  ) {
    super({
      message,
      messageParams: [assignmentName],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'FILE_STORAGE_SERVICE_NOT_FOUND_ERROR';

    this.context = {
      ...super.context,
      storageServiceName: assignmentName,
    };
  }
}
