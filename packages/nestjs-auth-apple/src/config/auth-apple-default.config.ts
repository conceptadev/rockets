import { registerAs } from '@nestjs/config';
import { AUTH_APPLE_MODULE_DEFAULT_SETTINGS_TOKEN } from '../auth-apple.constants';
import { AuthAppleSettingsInterface } from '../interfaces/auth-apple-settings.interface';
import { AuthAppleLoginDto } from '../dto/auth-apple-login.dto';
import { mapProfile } from '../utils/auth-apple-map-profile';
import { authAppleScopeParser } from '../utils/auth-apple-scope-parser.util';

/**
 * Default configuration for auth apple.
 */
export const authAppleDefaultConfig = registerAs(
  AUTH_APPLE_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): AuthAppleSettingsInterface => ({
    /**
     * The login dto
     */
    loginDto: AuthAppleLoginDto,
    clientID: process.env.APPLE_CLIENT_ID ?? '',
    callbackURL: process.env.APPLE_CALLBACK_URL ?? '',
    teamID: process.env.APPLE_TEAM_ID ?? '',
    keyID: process.env.APPLE_KEY_ID ?? '',
    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_LOCATION ?? '',
    privateKeyString:
      process.env.APPLE_PRIVATE_KEY_STRING ?? '',
    passReqToCallback: false,
    scope:
      'APPLE_SCOPE' in process.env && process.env.APPLE_SCOPE
        ? authAppleScopeParser(process.env.APPLE_SCOPE)
        : ['email'],
    mapProfile: mapProfile,
  }),
);
