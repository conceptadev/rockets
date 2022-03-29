import { IdentityInterface } from '@concepta/nestjs-common';
import { JwtIssueServiceInterface } from '@concepta/nestjs-jwt';
import { AuthenticationJwtResponseInterface } from './authentication-jwt-response.interface';

export interface IssueTokenServiceInterface extends JwtIssueServiceInterface {
  responsePayload(
    id: IdentityInterface['id'],
  ): Promise<AuthenticationJwtResponseInterface>;
}
