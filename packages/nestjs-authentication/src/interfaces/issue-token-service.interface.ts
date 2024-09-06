import { ReferenceId } from '@concepta/ts-core';
import { AuthenticationResponseInterface } from '@concepta/ts-common';
import { JwtIssueTokenServiceInterface } from '@concepta/nestjs-jwt';

export interface IssueTokenServiceInterface
  extends JwtIssueTokenServiceInterface {
  responsePayload(id: ReferenceId): Promise<AuthenticationResponseInterface>;
}
