import { format } from 'util';
import { HttpStatus } from '@nestjs/common';
import { mapNonErrorToException } from '@concepta/nestjs-common';
import { RuntimeExceptionInterface } from '../interfaces/runtime-exception.interface';
import { RuntimeExceptionOptions } from '../interfaces/runtime-exception-options.interface';
import { RuntimeExceptionContext } from '../exception.types';

export class RuntimeException
  extends Error
  implements RuntimeExceptionInterface
{
  private _errorCode = 'RUNTIME_EXCEPTION';
  private _httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  private _safeMessage?: string;
  public context: RuntimeExceptionContext = {};

  constructor(
    message?: string,
    options?: Omit<RuntimeExceptionOptions, 'message'>,
  );
  constructor(options?: RuntimeExceptionOptions);

  constructor(
    messageOrOptions?: string | RuntimeExceptionOptions,
    options?: Omit<RuntimeExceptionOptions, 'message'>,
  ) {
    let message: string | undefined;

    let finalOptions:
      | RuntimeExceptionOptions
      | Omit<RuntimeExceptionOptions, 'message'> = {};

    if (typeof messageOrOptions === 'object') {
      message = messageOrOptions?.message;
      finalOptions = messageOrOptions;
    } else if (options) {
      message = messageOrOptions;
      finalOptions = options;
    } else {
      message = messageOrOptions;
    }

    if (typeof message !== 'string') {
      message = 'Runtime Exception';
    }

    const {
      messageParams = [],
      safeMessage,
      safeMessageParams = [],
      originalError,
      httpStatus,
    } = finalOptions;

    super(format(message, ...messageParams));

    if (httpStatus) {
      this._httpStatus = httpStatus;
    }

    if (safeMessage) {
      this._safeMessage = format(safeMessage, ...safeMessageParams);
    }

    this.context.originalError = mapNonErrorToException(originalError);
  }

  public get errorCode() {
    return this._errorCode;
  }

  protected set errorCode(v: string) {
    this._errorCode = v;
  }

  public get httpStatus() {
    return this._httpStatus;
  }

  public get safeMessage() {
    return this._safeMessage;
  }
}
