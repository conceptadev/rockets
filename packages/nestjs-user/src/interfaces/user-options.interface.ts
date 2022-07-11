import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';
import { UserSettingsInterface } from './user-settings.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  userLookupService?: UserLookupServiceInterface;
  userMutateService?: UserMutateServiceInterface;
}
