import { AccessControl, IQueryInfo } from 'accesscontrol';
import { ExecutionContext } from '@nestjs/common';

export interface AccessControlContextArgsInterface {
  request: unknown;
  user: unknown;
  query: IQueryInfo;
  accessControl: AccessControl;
  executionContext: ExecutionContext;
}
