import { AccessControlService } from './access-control-service.interface';
import { AccessControl } from 'accesscontrol';
import { Type } from '@nestjs/common';

export interface AccessControlModuleOptions {
  service: Type<AccessControlService>;
  rules: AccessControl;
}
