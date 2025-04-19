import { CanAccess } from '@concepta/nestjs-access-control';
import { UserSettingsInterface } from './user-settings.interface';
import { UserModelServiceInterface } from './user-model-service.interface';
import { UserPasswordServiceInterface } from './user-password-service.interface';
import { UserPasswordHistoryServiceInterface } from './user-password-history-service.interface';
import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  userModelService?: UserModelServiceInterface;
  userPasswordService?: UserPasswordServiceInterface;
  userPasswordHistoryService?: UserPasswordHistoryServiceInterface;
  userAccessQueryService?: CanAccess;

  /**
   * @deprecated - will be removed after model service refactoring
   */
  userLookupService?: UserLookupServiceInterface;

  /**
   * @deprecated - will be removed after model service refactoring
   */
  userMutateService?: UserMutateServiceInterface;
}
