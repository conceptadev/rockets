import { AuthRefreshInterface } from '../interfaces/auth-refresh.interface';

export class AuthRefreshDto implements AuthRefreshInterface {
  refreshToken?: string;
}
