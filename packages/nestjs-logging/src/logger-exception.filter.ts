import {
  ArgumentsHost,
  Catch,
  HttpServer,
  Inject,
  Injectable,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

import { LoggerService } from './logger.service';

/**
 *
 * The Logger Exception Filter Class
 *
 * Out of the box, this action is performed by a built-in global exception
 * filter, which handles exceptions of type HttpException
 *
 */
@Catch()
@Injectable()
export class LoggerExceptionFilter extends BaseExceptionFilter {
  
  /**
   * Constructor 
   * @param loggerService 
   * @param applicationRef 
   */
  constructor(
    @Inject(LoggerService)
    private loggerService: LoggerService,
    @Inject(HttpAdapterHost)
    applicationRef?: HttpServer,
  ) {
    super(applicationRef);
  }

  /**
   * Override catch to log before returning exception.
   */
  catch(exception: Error, host: ArgumentsHost) {
    this.loggerService.exception(
      exception,
      undefined,
      LoggerExceptionFilter.name,
    );
    super.catch(exception, host);
  }
}
