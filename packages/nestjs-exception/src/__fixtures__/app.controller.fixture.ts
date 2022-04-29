import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomNotFoundExceptionFixture } from './exceptions/custom-not-found.exception.fixture';

/**
 * Controller.
 */
@Controller('test')
export class AppControllerFixture {
  @Get('unknown')
  getError(): void {
    throw new Error();
  }

  @Get('bad-request')
  getErrorBadRequest(): void {
    throw new BadRequestException();
  }

  @Get(':id')
  getErrorNotFound(@Param('id', ParseIntPipe) id: number): void {
    throw new CustomNotFoundExceptionFixture(id);
  }
}
