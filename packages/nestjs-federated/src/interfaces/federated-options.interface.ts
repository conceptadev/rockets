import { FederatedSettingsInterface } from './federated-settings.interface';
import { FederatedUserModelServiceInterface } from './federated-user-model-service.interface';

export interface FederatedOptionsInterface {
  /**
   * Implementation of user model service class.
   */
  userModelService: FederatedUserModelServiceInterface;

  /**
   * Settings
   */
  settings?: FederatedSettingsInterface;
}
