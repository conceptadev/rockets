import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomNotFoundException } from '../exceptions/custom-not-found.exception';

/**
 * Controller.
 */
@Controller('test')
export class AppController {
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
    throw new CustomNotFoundException(id);
  }
}
