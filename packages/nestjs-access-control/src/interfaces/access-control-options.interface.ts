import { AccessControlServiceInterface } from './access-control-service.interface';
import { AccessControlSettingsInterface } from './access-control-settings.interface';

export interface AccessControlOptionsInterface {
  settings: AccessControlSettingsInterface;
  service?: AccessControlServiceInterface;
}
