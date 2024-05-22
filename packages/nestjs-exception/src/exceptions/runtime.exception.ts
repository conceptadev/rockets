import { format } from 'util';
import { HttpStatus } from '@nestjs/common';
import { mapNonErrorToException } from '@concepta/ts-core';
import { RuntimeExceptionInterface } from '../interfaces/runtime-exception.interface';
import { RuntimeExceptionOptions } from '../interfaces/runtime-exception-options.interface';

export class RuntimeException
  extends Error
  implements RuntimeExceptionInterface
{
  errorCode = 'RUNTIME_EXCEPTION';
  httpStatus?: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  safeMessage?: string;

  context: {
    originalError: Error;
  };

  constructor(
    options: RuntimeExceptionOptions = { message: 'Runtime Exception' },
  ) {
    const {
      message = '',
      messageParams = [],
      safeMessage,
      safeMessageParams = [],
      originalError,
      httpStatus,
    } = options;

    super(format(message, ...messageParams));

    if (httpStatus) {
      this.httpStatus = httpStatus;
    }

    if (safeMessage) {
      this.safeMessage = format(safeMessage, ...safeMessageParams);
    }

    this.context = {
      originalError: mapNonErrorToException(originalError),
    };
  }
}
