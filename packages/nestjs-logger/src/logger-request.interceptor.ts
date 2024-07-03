import {
  FastifyRequest as Request,
  LightMyRequestResponse as Response,
} from 'fastify';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { LoggerService } from './logger.service';
import { MessageFormatUtil } from './utils/message-format.util';

/**
 *
 * The Interceptor to log message for all requests and response errors.
 */
@Injectable()
export class LoggerRequestInterceptor implements NestInterceptor<Response> {
  /**
   * Constructor
   *
   * @param loggerService - The logger service that implements ConsoleLogger
   */
  constructor(private loggerService: LoggerService) {}

  /**
   * Method to implement a custom intercept
   *
   * @param context - Execution context
   * @param next - Call handler
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();
    const startDate = new Date();

    // format the request message
    const message = MessageFormatUtil.formatRequestMessage(req);

    // log the incoming request
    this.loggerService.log(message);

    return next.handle().pipe(
      tap(() => this.responseSuccess(req, res, startDate)),
      catchError((error: Error) =>
        this.responseError(req, res, startDate, error),
      ),
    );
  }

  /**
   * Method to log response success
   *
   * @param req - Request
   * @param res - Response
   * @param startDate - the date for the message
   */
  responseSuccess(req: Request, res: Response, startDate: Date) {
    // format the response message
    const message = MessageFormatUtil.formatResponseMessage(
      req,
      res,
      startDate,
    );

    // log the response, after method was called
    this.loggerService.log(message);
  }

  /**
   * Format exception error
   *
   * @param req - Request
   * @param res - Response
   * @param startDate - Start date
   * @param error - Error instance
   * @returns
   */
  responseError(req: Request, res: Response, startDate: Date, error: Error) {
    // format the message
    const message = MessageFormatUtil.formatResponseMessage(
      req,
      res,
      startDate,
      error,
    );

    // log as an exception
    this.loggerService.exception(error, message);

    // all done, re-throw original error
    return throwError(error);
  }
}
