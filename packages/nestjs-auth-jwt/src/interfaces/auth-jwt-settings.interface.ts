import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface AuthJwtSettingsInterface extends OptionsInterface {
  ignoreExpiration?: boolean;
  secretOrKey?: string;
}
