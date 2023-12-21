import { registerAs } from '@nestjs/config';
import { AUTHENTICATION_MODULE_SETTINGS_TOKEN } from '../authentication.constants';
import { AuthenticationSettingsInterface } from '../interfaces/authentication-settings.interface';

export const authenticationDefaultConfig = registerAs(
  AUTHENTICATION_MODULE_SETTINGS_TOKEN,
  (): AuthenticationSettingsInterface => ({
    enableGuards: true,
  }),
);
