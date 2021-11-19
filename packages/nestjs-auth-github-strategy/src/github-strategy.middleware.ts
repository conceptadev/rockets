import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthenticationService } from '@rockts-org/nestjs-authentication';
import { Request, Response, NextFunction } from 'express';
import { GITHUB_STRATEGY_NAME } from './constants';

@Injectable()
export class GithubStrategyMiddleware implements NestMiddleware {
  
  // TODO: should i inject authenticationService?
  constructor(protected authService: AuthenticationService) { }
  
  use(req: Request, res: Response, next: NextFunction) {
    
    this.authService.authenticate(GITHUB_STRATEGY_NAME,
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

  

