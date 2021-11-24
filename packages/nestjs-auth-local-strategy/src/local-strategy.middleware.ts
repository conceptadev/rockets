import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '@rockts-org/nestjs-authentication';
import { LOCAL_STRATEGY_NAME } from './constants';

/**
 *  Middleware to handle local authentication
 */
@Injectable()
export class LocalStrategyMiddleware implements NestMiddleware {
  constructor(protected authService: AuthenticationService) {}

  // TODO: Update to use dynamically request or response for express or fastify
  async use(req: Request, res: Response, next: NextFunction) {
    
    await this.authService.authenticate(
      LOCAL_STRATEGY_NAME,
      { session: false },
      // request, response, next
      (request) => {
        req['user'] = request['user'];
      },
    );

    next();
  }
}
