import { Controller, Get } from '@nestjs/common';
import { LoggerCoralogixTransport } from '../transports/logger-coralogix.transport';

@Controller()
export class AppControllerFixture {
  constructor(private loggerCoralogixTransport: LoggerCoralogixTransport) {}
  @Get('throw')
  throwError() {
    this.loggerCoralogixTransport.log('throwError', 'error');
    throw new Error('Intentional Error');
  }
}
