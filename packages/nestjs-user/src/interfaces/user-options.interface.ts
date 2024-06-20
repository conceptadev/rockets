import { CanAccess } from '@concepta/nestjs-access-control';
import { UserSettingsInterface } from './user-settings.interface';
import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';
import { UserPasswordServiceInterface } from './user-password-service.interface';
import { UserPasswordHistoryServiceInterface } from './user-password-history-service.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  userLookupService?: UserLookupServiceInterface;
  userMutateService?: UserMutateServiceInterface;
  userPasswordService?: UserPasswordServiceInterface;
  userPasswordHistoryService?: UserPasswordHistoryServiceInterface;
  userAccessQueryService?: CanAccess;
}
