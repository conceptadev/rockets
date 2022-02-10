import { registerAs } from '@nestjs/config';
import { JwtSettingsInterface } from '../interfaces/jwt-settings.interface';
import { JWT_MODULE_DEFAULT_SETTINGS_TOKEN } from '../jwt.constants';

/**
 * Settings defaults.
 *
 * @todo need to also get defaults from ENV
 */
export const jwtDefaultConfig = registerAs(
  JWT_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): JwtSettingsInterface => ({
    access: {
      secret: 'THERE IS NO SECRET',
      signOptions: {
        expiresIn: '1h',
      },
    },
    refresh: {
      secret: 'THERE IS NO SECRET',
      signOptions: {
        expiresIn: '1y',
      },
    },
  }),
);
