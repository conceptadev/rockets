import { OptionsInterface } from '@concepta/ts-core';
import { CrudSerializationOptionsInterface } from './crud-serialization-options.interface';

export interface CrudSettingsInterface extends OptionsInterface {
  serialization?: CrudSerializationOptionsInterface;
}
