import { registerAs } from '@nestjs/config';
import { JwtSettingsInterface } from '../interfaces/jwt-settings.interface';
import { JWT_MODULE_DEFAULT_SETTINGS_TOKEN } from '../jwt.constants';

/**
 * Settings defaults.
 */
export const jwtDefaultConfig = registerAs(
  JWT_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): JwtSettingsInterface => ({
    access: {
      secretOrPrivateKey: 'THERE IS NO SECRET',
      signOptions: {
        expiresIn: '1h',
      },
    },
    refresh: {
      secretOrPrivateKey: 'THERE IS NO SECRET',
      signOptions: {
        expiresIn: '1y',
      },
    },
  }),
);
