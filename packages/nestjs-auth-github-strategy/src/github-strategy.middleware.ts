import { Injectable, NestMiddleware } from '@nestjs/common';
import { AuthenticationService } from '@rockts-org/nestjs-authentication';
import { GITHUB_STRATEGY_NAME } from './constants';

@Injectable()
export class GithubStrategyMiddleware implements NestMiddleware {
  // TODO: should i inject authenticationService?
  constructor(protected authService: AuthenticationService) {}

  use(req: unknown, res: unknown, next: () => void) {
    this.authService.authenticate(
      GITHUB_STRATEGY_NAME,
      { session: false },
      // request, response, next
      (request) => {
        req['user'] = request.user;
        next();
      },
    );
  }
}
