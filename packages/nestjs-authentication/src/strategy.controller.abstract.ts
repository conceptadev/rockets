import { AuthenticationService } from './services/authentication.service';

export abstract class StrategyController {
  constructor(protected authService: AuthenticationService) {}
}
