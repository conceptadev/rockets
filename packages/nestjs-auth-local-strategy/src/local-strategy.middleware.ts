import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticationService } from '@rockts-org/nestjs-authentication';
import { LOCAL_STRATEGY_NAME } from './constants';

@Injectable()
export class LocalStrategyMiddleware implements NestMiddleware {
  
  constructor(protected authService: AuthenticationService) { }
  
  use(req: Request, res: Response, next: NextFunction) {
    
    this.authService.authenticate(LOCAL_STRATEGY_NAME,
      { session: false },
      (request, response) => {
        
        console.log('>>> request ', request)
        console.log('>>> request.user ', request.user)
        
        req['user'] = request.user;
        
        next();
      }
    );
    
  }
}
