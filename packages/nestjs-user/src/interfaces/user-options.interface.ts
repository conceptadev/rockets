import { CanAccess } from '@concepta/nestjs-access-control';
import { UserSettingsInterface } from './user-settings.interface';
import { UserModelServiceInterface } from './user-model-service.interface';
import { UserPasswordServiceInterface } from './user-password-service.interface';
import { UserPasswordHistoryServiceInterface } from './user-password-history-service.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  userModelService?: UserModelServiceInterface;
  userPasswordService?: UserPasswordServiceInterface;
  userPasswordHistoryService?: UserPasswordHistoryServiceInterface;
  userAccessQueryService?: CanAccess;
}
