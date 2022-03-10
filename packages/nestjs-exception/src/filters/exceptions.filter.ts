import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpAdapterHost,
} from '@nestjs/common';
import { ERROR_CODE_UNKNOWN } from '../constants/error-codes.constants';
import { ExceptionInterface } from '../interfaces/exception.interface';
import { mapHttpStatus } from '../utils/map-http-status.util';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ExceptionInterface, host: ArgumentsHost): void {
    // in certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    // error is 500 unless it gets overridden
    let statusCode = 500;

    // is this an http exception?
    if (exception instanceof HttpException) {
      // set the status code
      statusCode = exception.getStatus();
      // are we missing the error code?
      if (!exception.errorCode) {
        // its missing, try to set it
        exception.errorCode = mapHttpStatus(statusCode);
      }
    }

    const responseBody = {
      statusCode,
      errorCode: exception?.errorCode ?? ERROR_CODE_UNKNOWN,
      message: exception.message,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
