import { RoleLookupServiceInterface } from './role-lookup-service.interface';
import { RoleMutateServiceInterface } from './role-mutate-service.interface';
import { RoleSettingsInterface } from './role-settings.interface';

export interface RoleOptionsInterface {
  settings: RoleSettingsInterface;
  roleLookupService?: RoleLookupServiceInterface;
  roleMutateService?: RoleMutateServiceInterface;
}
