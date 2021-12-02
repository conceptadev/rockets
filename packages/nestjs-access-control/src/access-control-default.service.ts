import { ExecutionContext, Injectable } from '@nestjs/common';
import { AccessControlService } from './interfaces/access-control-service.interface';

@Injectable()
export class AccessControlDefaultService implements AccessControlService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUser<T>(context: ExecutionContext): Promise<T> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getUserRoles(context: ExecutionContext): Promise<string | string[]> {
    throw new Error('Method not implemented.');
  }
}
