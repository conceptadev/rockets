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
import { RuntimeException } from '../../exceptions/runtime.exception';
import { DummyDto } from './dummy.dto';
import { CustomNotFoundExceptionFixture } from './custom-not-found.exception.fixture';

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

  @Get('safe-message-fallback')
  getOnlySafeMessage(): void {
    throw new RuntimeException({
      message: '',
      safeMessage: 'This is a safe message',
    });
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
