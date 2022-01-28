import { OptionsInterface } from '@rockts-org/nestjs-common';
import { RefreshTokenSettingsInterface } from './refresh-token-settings.interface';

export interface RefreshTokenOptionsInterface extends OptionsInterface {
  settings?: RefreshTokenSettingsInterface;
}
