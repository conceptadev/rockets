import { ReferenceId } from '@concepta/ts-core';
import { AuthenticationResponseInterface } from '@concepta/ts-common';
import { JwtIssueServiceInterface } from '@concepta/nestjs-jwt';

export interface IssueTokenServiceInterface extends JwtIssueServiceInterface {
  responsePayload(id: ReferenceId): Promise<AuthenticationResponseInterface>;
}
