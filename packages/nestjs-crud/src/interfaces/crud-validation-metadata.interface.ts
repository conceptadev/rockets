import { Body } from '@nestjs/common';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { CrudValidationOptions } from '../crud.types';

export interface CrudValidationMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  parameterIndex: number;
  validation: CrudValidationOptions | undefined;
  pipes: Parameters<typeof Body>[1][] | [];
}
