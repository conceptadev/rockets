import { OptionsInterface } from '@rockts-org/nestjs-common';
import { CrudSerializationOptionsInterface } from './crud-serialization-options.interface';

export interface CrudSettingsInterface extends OptionsInterface {
  serialization?: CrudSerializationOptionsInterface;
}
