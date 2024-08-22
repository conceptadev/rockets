import { Controller, Get } from '@nestjs/common';
import { LoggerService } from '@concepta/nestjs-logger';

@Controller()
export class AppControllerFixture {
  constructor(private loggerService: LoggerService) {}
  @Get('log')
  logError() {
    this.loggerService.error('throwError', 'error');
  }
}
