import { Type } from '@nestjs/common';
import { AccessControlServiceInterface } from './access-control-service.interface';
import { AccessControlSettingsInterface } from './access-control-settings.interface';

export interface AccessControlModuleOptionsInterface {
  settings: AccessControlSettingsInterface;
  service?: Type<AccessControlServiceInterface>;
}
