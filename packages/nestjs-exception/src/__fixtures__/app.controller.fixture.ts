import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DummyDto } from './dummy.dto';
import { CustomNotFoundExceptionFixture } from './exceptions/custom-not-found.exception.fixture';

/**
 * Controller.
 */
@Controller('test')
@ApiTags('test')
export class AppControllerFixture {
  @Get('unknown')
  getError(): void {
    throw new Error();
  }

  @Get('bad-request')
  getErrorBadRequest(): void {
    throw new BadRequestException();
  }

  @UsePipes(new ValidationPipe())
  @Post('/bad-validation')
  getBadValidation(@Body() value: DummyDto): DummyDto {
    return value;
  }

  @Get(':id')
  getErrorNotFound(@Param('id', ParseIntPipe) id: number): void {
    throw new CustomNotFoundExceptionFixture(id);
  }
}
