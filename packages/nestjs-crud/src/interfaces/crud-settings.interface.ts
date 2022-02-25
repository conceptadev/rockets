import { OptionsInterface } from '@rockts-org/nestjs-common';
import { CrudSerializeOptionsInterface } from './crud-serialize-options.interface';

export interface CrudSettingsInterface extends OptionsInterface {
  serialize?: CrudSerializeOptionsInterface;
}
