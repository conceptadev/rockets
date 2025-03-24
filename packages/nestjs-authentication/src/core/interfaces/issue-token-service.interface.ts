import { ReferenceId } from '@concepta/nestjs-common';
import { AuthenticationResponseInterface } from '@concepta/nestjs-common';
import { JwtIssueTokenServiceInterface } from '../../jwt/interfaces/jwt-issue-token-service.interface';

export interface IssueTokenServiceInterface
  extends JwtIssueTokenServiceInterface {
  responsePayload(id: ReferenceId): Promise<AuthenticationResponseInterface>;
}
