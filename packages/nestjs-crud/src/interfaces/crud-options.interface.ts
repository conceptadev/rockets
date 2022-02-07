import { OptionsInterface } from '@rockts-org/nestjs-common';
import { CrudSettingsInterface } from './crud-settings.interface';

export interface CrudOptionsInterface extends OptionsInterface {
  settings?: CrudSettingsInterface;
}
