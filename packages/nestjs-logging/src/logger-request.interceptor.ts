
import { FastifyRequest as Request, LightMyRequestResponse as Response } from 'fastify';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';

import { LoggerService } from './logger.service';

@Injectable()
export class LoggerRequestInterceptor<T>
  implements NestInterceptor<T, Response> {
  constructor(private loggerService: LoggerService) {}
  
  intercept(
    _context: ExecutionContext,
    _next: CallHandler
  ): Observable<Response> {
    const req: Request = _context.switchToHttp().getRequest();
    const res: Response = _context.switchToHttp().getResponse();
    const startDate = new Date();

    // format the request message
    const message = this.loggerService.formatRequestMessage(req);

    // log the incoming request
    this.loggerService.log(message);

    return _next.handle().pipe(
      tap(() => this.responseSuccess(req, res, startDate)),
      catchError((error: Error) => this.responseError(req, res, startDate, error))
    );
  }

  responseSuccess (req:any, res:any, startDate:any) {
    // format the response message
    const message = this.loggerService.formatResponseMessage(
      req,
      res,
      startDate
    );
    // log the response, after method was called
    this.loggerService.log(message);
  }

  responseError (req:any, res:any, startDate:any, error: Error) {
    // format the message
    const message = this.loggerService.formatResponseMessage(
      req,
      res,
      startDate,
      error
    );

    // log as an exception
    this.loggerService.exception(error, message);
    
    // all done, re-throw original error
    return throwError(error);
  }
}
