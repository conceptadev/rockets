import { HttpException, Injectable, Logger } from '@nestjs/common';
import { LogLevel } from '@nestjs/common/services/logger.service';

import { LoggerTransportService } from './logger-transport.service';
import { LoggerServiceInterface } from './interfaces/logger-service.interface';
import { LoggerTransportInterface } from './interfaces/logger-transport.interface';

/**
 * A Custom logger Service
 *
 */
@Injectable()
export class LoggerService extends Logger implements LoggerServiceInterface {
  constructor(
    private transportService: LoggerTransportService) {
      super();
  }
  
  /**
   * Add a transport to be used for every log, it can be multiples
   * 
   * @param transport The transport that will be used beside the system logger 
   */
  addTransport(transport: LoggerTransportInterface): void {
    this.transportService.addTransport(transport);
  }

  /**
   * Method to log an exception, if the exception is between 400 and 500 status code
   * 
   * it will be logged as a debug log level, otherwise it will be logged as an error
   * 
   * @param error 
   * @param message 
   * @param context 
   */
  exception(error: Error, message?: string, context?: string | undefined): void {
    // message is missing?
    if (!message) {
      // yes, set it
      message = error.message;
    }
    
    // is this a low severity http exception?
    if (
      error instanceof HttpException &&
      error.getStatus() >= 400 &&
      error.getStatus() < 500
    ) {
      // not severe, log it as debug
      super.debug(message, context);
      // pass full exception to transport service
      this.transportService.log(message, 'debug' as LogLevel, error);
    } else {
      // log as error
      super.error(message, error.stack, context);
      // pass full exception to transport service
      this.transportService.log(message, 'error' as LogLevel, error);
    }
  }

  /**
   * Method to be called when a error should be logged 
   * 
   * @param message 
   * @param trace 
   * @param context 
   */
  error(
    message: string,
    trace?: string | undefined,
    context?: string | undefined
  ): void {
    super.error(message, trace, context);
    // get a trace?
    if (trace) {
      // yes, build up real error
      const error = new Error(message);
      error.stack = trace;
      // call transport with error
      this.transportService.log(message, 'error' as LogLevel, error);
    } else {
      // call transport with no error
      this.transportService.log(message, 'error' as LogLevel);
    }
  }

  /**
   * Method to be used when a warn message should be logged
   * @param message 
   * @param context 
   */
  warn(message: string, context?: string) {
    super.warn(message, context);
    this.transportService.log(message, 'warn' as LogLevel);
  }

  /**
   * Method to be used when a debug message should be logged
   * @param message 
   * @param context 
   */
  debug(message: string, context?: string) {
    super.debug(message, context);
    this.transportService.log(message, 'debug' as LogLevel);
  }

  /**
   * Method to be used when a simple log message should be logged
   * @param message 
   * @param context 
   */
  log(message: string, context?: string) {
    super.log(message, context);
    this.transportService.log(message, 'log' as LogLevel);
  }

  /**
   * Method to be used when a verbose message should be logged
   * @param message 
   * @param context 
   */
  verbose(message: string, context?: string) {
    super.verbose(message, context);
    this.transportService.log(message, 'verbose' as LogLevel);
  }
}
