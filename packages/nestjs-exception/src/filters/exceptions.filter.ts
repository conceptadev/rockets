import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpAdapterHost,
} from '@nestjs/common';
import { ExceptionInterface } from '@concepta/ts-core';
import { ERROR_CODE_UNKNOWN } from '../constants/error-codes.constants';
import { RuntimeException } from '../exceptions/runtime.exception';
import { mapHttpStatus } from '../utils/map-http-status.util';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ExceptionInterface, host: ArgumentsHost): void {
    // in certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // error code is UNKNOWN unless it gets overridden
    let errorCode = ERROR_CODE_UNKNOWN;

    // error is 500 unless it gets overridden
    let statusCode = 500;

    // what will this message be?
    let message: string = 'Internal Server Error';

    // is this an http exception?
    if (exception instanceof HttpException) {
      // set the status code
      statusCode = exception.getStatus();
      // map the error code
      errorCode = mapHttpStatus(statusCode);
      // set the message
      message = exception.message;
    } else if (exception instanceof RuntimeException) {
      // its a runtime exception, set error code
      errorCode = exception.errorCode;
      // did they provide a status hint?
      if (exception?.httpStatus) {
        statusCode = exception.httpStatus;
      }
      // set the message
      if (statusCode >= 500) {
        // use safe message or internal sever error
        message = exception?.safeMessage ?? 'Internal Server Error';
      } else if (exception?.safeMessage) {
        // use the safe message
        message = exception.safeMessage;
      } else {
        // use the error message
        message = exception.message;
      }
    }

    const responseBody = {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
