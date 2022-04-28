import { OptionsInterface } from '@concepta/nestjs-common';
import { UserLookupServiceInterface } from './user-lookup-service.interface';
import { UserMutateServiceInterface } from './user-mutate-service.interface';
import { UserSettingsInterface } from './user-settings.interface';

export interface UserOptionsInterface extends OptionsInterface {
  settings?: UserSettingsInterface;
  userLookupService?: UserLookupServiceInterface;
  userMutateService?: UserMutateServiceInterface;
}
