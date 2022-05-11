import { registerAs } from '@nestjs/config';
import { FEDERATED_MODULE_DEFAULT_SETTINGS_TOKEN } from '../federated.constants';
import { FederatedSettingsInterface } from '../interfaces/federated-settings.interface';

/**
 * Default configuration for auth local.
 */
export const federatedDefaultConfig = registerAs(
  FEDERATED_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): FederatedSettingsInterface => ({}),
);
