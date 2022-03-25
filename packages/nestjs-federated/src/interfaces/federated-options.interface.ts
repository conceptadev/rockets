import {
  ModuleOptionsSettingsInterface,
  OptionsInterface,
} from '@concepta/nestjs-common';
import { FederatedSettingsInterface } from './federated-settings.interface';
import { FederatedUserCreateServiceInterface } from './federated-user-create-service.interface';
import { FederatedUserLookupServiceInterface } from './federated-user-lookup-service.interface';

export interface FederatedOptionsInterface
  extends OptionsInterface,
    ModuleOptionsSettingsInterface {
  /**
   * Implementation of a class to lookup users
   */
  userLookupService?: FederatedUserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  userCreateService?: FederatedUserCreateServiceInterface;

  /**
   * Settings
   */
  settings?: FederatedSettingsInterface;
}
