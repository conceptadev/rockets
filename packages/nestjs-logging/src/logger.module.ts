import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { loggerSentryConfig } from './config/logger-sentry.config';
import { loggerConfig } from './config/logger.config';
import { LoggerExceptionFilter } from './logger-exception.filter';
import { LoggerRequestInterceptor } from './logger-request.interceptor';
import { LoggerTransportService } from './logger-transport.service';
import { LoggerService } from './logger.service';

@Module({
  imports: [
    ConfigModule.forFeature(loggerConfig),
    ConfigModule.forFeature(loggerSentryConfig),
  ],
  providers: [
    LoggerService,
    LoggerTransportService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerRequestInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: LoggerExceptionFilter,
    },
  ],
  exports: [
    LoggerService
  ]
})
export class LoggerModule {}
