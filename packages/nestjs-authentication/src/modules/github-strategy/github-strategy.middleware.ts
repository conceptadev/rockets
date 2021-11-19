import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticationService } from '../../services/authentication.service';

@Injectable()
export class GithubStrategyMiddleware implements NestMiddleware {
  
  // TODO: should i inject authenticationService?
  constructor(protected authService: AuthenticationService) { }
  
  use(req: Request, res: Response, next: NextFunction) {
    
    // will this set the user to the Request?
    this.authService.authenticate('github',{
      session:false
    });

    
    //TODO: validate how password should be called here
    // This should call LocalStrategyService logic
    passport.authenticate('github', {
      session:false
    }, next);
    
    next(() => {
      return passport.authenticate('github', {
        session:false
      });
    });
  }

}
