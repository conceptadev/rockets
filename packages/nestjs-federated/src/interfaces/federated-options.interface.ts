import {
  ModuleOptionsControllerInterface,
  ModuleOptionsSettingsInterface,
} from '@concepta/nestjs-core';
import { FederatedSettingsInterface } from './federated-settings.interface';
import { FederatedUserMutateServiceInterface } from './federated-user-mutate-service.interface';
import { FederatedUserLookupServiceInterface } from './federated-user-lookup-service.interface';

export interface FederatedOptionsInterface
  extends ModuleOptionsSettingsInterface<FederatedSettingsInterface>,
    ModuleOptionsControllerInterface {
  /**
   * Implementation of a class to lookup users
   */
  userLookupService: FederatedUserLookupServiceInterface;

  /**
   * Implementation of a class to issue tokens
   */
  userMutateService: FederatedUserMutateServiceInterface;

  /**
   * Settings
   */
  settings?: FederatedSettingsInterface;
}
