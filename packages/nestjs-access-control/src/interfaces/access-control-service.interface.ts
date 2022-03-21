import { ExecutionContext } from '@nestjs/common';

export interface AccessControlServiceInterface {
  getUser<T>(context: ExecutionContext): Promise<T>;
  getUserRoles(context: ExecutionContext): Promise<string | string[]>;
}
