import { LogLevel, NestInterceptor, Type } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerExceptionFilter, LoggerRequestInterceptor } from '..';
import { LoggerSentryConfigInterface } from './logger-sentry-config.interface';
import { LoggerSettingsInterface } from './logger-settings.interface';
import { LoggerTransportInterface } from './logger-transport.interface';

/**
 * Logger options interface.
 */
export interface LoggerOptionsInterface {
  // /**
  //  * list of log levels allowed
  //  */
  // logLevel?: LogLevel[];

  // /**
  //  * List of transport log level allowed
  //  */
  // transportLogLevel?: LogLevel[];

  // /**
  //  * Configuration for Sentry
  //  */
  // transportSentryConfig?: LoggerSentryConfigInterface;

  transports?: LoggerTransportInterface[];

  exceptionFilter?: BaseExceptionFilter;

  requestInterceptor?: NestInterceptor<Response>;

  //TODO: REVIEW SETTINGS
  settings?: LoggerSettingsInterface;
}
