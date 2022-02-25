import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { CommonExceptionInterface } from '../interfaces/common-exception.interface';
import { RocketsCode } from '../constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpException & CommonExceptionInterface,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    //const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const rocketsCode = exception.rocketsCode
      ? exception.rocketsCode
      : RocketsCode.DEFAULT;

    response.status(status).json({
      rocketsCode,
      status,
      message: exception.message,
    });
  }
}
