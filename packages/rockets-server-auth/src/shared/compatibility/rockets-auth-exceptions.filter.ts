import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { RuntimeException as ConceptaRuntimeException } from '@concepta/nestjs-core';
import {
  ExceptionInterface,
  ExceptionsFilter,
  RuntimeException as ConceptaDevRuntimeException,
} from '@concepta/nestjs-core';

const ERROR_CODE_UNKNOWN = 'UNKNOWN';
const ERROR_MESSAGE_FALLBACK = 'Internal Server Error';

/**
 * Until upstream `@concepta/nestjs-*` exceptions are ported to
 * `@concepta/rockets-app`, their `RuntimeException` class is a different
 * constructor — conceptadev's global filter treats them as unknown errors (500).
 */
@Catch()
export class RocketsAuthExceptionsFilter implements ExceptionFilter {
  private readonly conceptadevFilter: ExceptionsFilter;

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {
    this.conceptadevFilter = new ExceptionsFilter(httpAdapterHost);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (
      exception instanceof ConceptaDevRuntimeException ||
      exception instanceof HttpException
    ) {
      this.conceptadevFilter.catch(toExceptionInterface(exception), host);
      return;
    }

    if (exception instanceof ConceptaRuntimeException) {
      const { httpAdapter } = this.httpAdapterHost;
      const ctx = host.switchToHttp();

      const statusCode =
        exception.httpStatus ?? HttpStatus.INTERNAL_SERVER_ERROR;
      let message: unknown = ERROR_MESSAGE_FALLBACK;

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        message = exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      } else if (exception.safeMessage) {
        message = exception.safeMessage;
      } else {
        message =
          exception.message ?? exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      }

      const responseBody = {
        statusCode,
        errorCode: exception.errorCode ?? ERROR_CODE_UNKNOWN,
        message,
        timestamp: new Date().toISOString(),
      };

      httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
      return;
    }

    this.conceptadevFilter.catch(toExceptionInterface(exception), host);
  }
}

function toExceptionInterface(exception: unknown): ExceptionInterface {
  if (exception instanceof Error) {
    return Object.assign(exception, {
      errorCode:
        'errorCode' in exception &&
        typeof (exception as ExceptionInterface).errorCode === 'string'
          ? (exception as ExceptionInterface).errorCode
          : ERROR_CODE_UNKNOWN,
    });
  }

  return Object.assign(new Error(String(exception)), {
    errorCode: ERROR_CODE_UNKNOWN,
  });
}
