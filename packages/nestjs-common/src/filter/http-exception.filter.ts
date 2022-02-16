import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { RocketsException } from '../exception/rockets.exception';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: RocketsException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    //const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    
    const rocketsCode = exception.rocketsCode
      ? exception.rocketsCode : 'UNKNOWN';

    response
      .status(status)
      .json({
        rocketsCode,
        status,
        message: exception.message,
      });
  }
}
//{ statusCode: 400, message: 'Bad request', error: 'Bad Request' }
/**
 *   response {
      statusCode: 400,
      timestamp: '2022-02-16T22:05:48.300Z',
      path: '/custom/user/error'
    }
 */