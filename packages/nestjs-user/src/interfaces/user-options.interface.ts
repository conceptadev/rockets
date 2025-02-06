import { CanAccess } from '@concepta/nestjs-access-control';
import { UserSettingsInterface } from './user-settings.interface';
import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';
import { UserPasswordServiceInterface } from './user-password-service.interface';
import { UserPasswordHistoryServiceInterface } from './user-password-history-service.interface';
import { UserRoleServiceInterface } from './user-role-service.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  userLookupService?: UserLookupServiceInterface;
  userMutateService?: UserMutateServiceInterface;
  userPasswordService?: UserPasswordServiceInterface;
  userRoleService?: UserRoleServiceInterface;
  userPasswordHistoryService?: UserPasswordHistoryServiceInterface;
  userAccessQueryService?: CanAccess;
}
