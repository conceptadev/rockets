import { NestInterceptor } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { LoggerSettingsInterface } from './logger-settings.interface';
import { LoggerTransportInterface } from './logger-transport.interface';

/**
 * Logger options interface.
 */
export interface LoggerOptionsInterface {
  transports?: LoggerTransportInterface[];

  exceptionFilter?: BaseExceptionFilter;

  requestInterceptor?: NestInterceptor<Response>;

  settings?: LoggerSettingsInterface;
}
