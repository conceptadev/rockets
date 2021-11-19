import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticationService } from '../../services/authentication.service';

@Injectable()
export class LocalStrategyMiddleware implements NestMiddleware {
  
  // TODO: should i inject authenticationService?
  constructor(protected authService: AuthenticationService) { }
  
  use(req: Request, res: Response, next: NextFunction) {
    
    // ??
    this.authService.authenticate('local',{
      session:false
    });
    
    //TODO: validate how password should be called here
    // This should call LocalStrategyService logic
    passport.authenticate('local', {
      session:false
    });
    
    next();
  }
}
