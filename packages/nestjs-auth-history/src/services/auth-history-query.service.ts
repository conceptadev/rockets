import {
  AccessControlContext,
  CanAccess,
} from '@concepta/nestjs-access-control';
import { Injectable } from '@nestjs/common';

// TODO: check if this is actually needed
@Injectable()
export class AuthHistoryAccessQueryService implements CanAccess {
  async canAccess(_context: AccessControlContext): Promise<boolean> {
    return true;
  }
}
