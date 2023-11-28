import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppControllerFixture {
  @Get('throw')
  throwError() {
    throw new Error('Intentional Error');
  }
}
