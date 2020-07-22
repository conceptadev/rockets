import { ExecutionContext } from '@nestjs/common';

export interface AccessControlService {
  getUser<T>(context: ExecutionContext): Promise<T>;
  getUserRoles(context: ExecutionContext): Promise<string | string[]>;
}
