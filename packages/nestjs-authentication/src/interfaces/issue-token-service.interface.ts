import { JwtIssueServiceInterface } from '@rockts-org/nestjs-jwt';
import { AuthenticationJwtResponseInterface } from './authentication-jwt-response.interface';

export interface IssueTokenServiceInterface extends JwtIssueServiceInterface {
  responsePayload(id: string): Promise<AuthenticationJwtResponseInterface>;
}
