import { ArgumentsHost, Catch, HttpServer, Inject, Injectable } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { threadId } from 'worker_threads';

import { LoggerService } from './logger.service';

@Catch()
@Injectable()
export class LoggerExceptionFilter extends BaseExceptionFilter {

  loggerService: LoggerService;

  constructor (
    @Inject(LoggerService)
    loggerService: LoggerService,
    @Inject(HttpAdapterHost)
    applicationRef?: HttpServer
  ) {
    super(applicationRef);
    this.loggerService = loggerService;
  }

  /**
   * Override catch to log before returning exception.
   */
  catch(exception: Error, host: ArgumentsHost) {
    this.loggerService.exception(
      exception,
      undefined,
      LoggerExceptionFilter.name
    );
    super.catch(exception, host);
  }
}
