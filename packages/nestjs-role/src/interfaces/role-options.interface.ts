import { RoleModelServiceInterface } from './role-model-service.interface';
import { RoleSettingsInterface } from './role-settings.interface';

export interface RoleOptionsInterface {
  settings: RoleSettingsInterface;
  roleModelService?: RoleModelServiceInterface;
}
