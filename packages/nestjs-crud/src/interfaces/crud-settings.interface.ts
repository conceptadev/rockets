import { OptionsInterface } from '@rockts-org/nestjs-common';
import { CrudValidationOptions } from '../crud.types';

export interface CrudSettingsInterface extends OptionsInterface {
  validation?: CrudValidationOptions;
}
