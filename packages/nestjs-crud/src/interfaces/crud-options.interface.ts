import { OptionsInterface } from '@concepta/ts-core';
import { CrudSettingsInterface } from './crud-settings.interface';

export interface CrudOptionsInterface extends OptionsInterface {
  settings?: CrudSettingsInterface;
}
