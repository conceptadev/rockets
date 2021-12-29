import { OptionsInterface } from '@rockts-org/nestjs-common';
import { UserSettingsInterface } from './user-settings.interface';

export interface UserOptionsInterface extends OptionsInterface {
  settings?: UserSettingsInterface;
}
