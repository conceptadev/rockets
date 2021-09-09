import { LoggerTransportInterface } from './logger-transport.interface';

export interface LoggerServiceInterface {
  addTransport(transport: LoggerTransportInterface): void;
  exception(error: Error, message?: string, context?: string | undefined) : void
  error(message: string, trace?: string | undefined, context?: string | undefined ): void ;
  warn(message: string, context?: string) : void;
  debug(message: string, context?: string): void;
  log(message: string, context?: string) : void;
  verbose(message: string, context?: string): void;
}
