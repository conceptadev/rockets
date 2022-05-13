import { Body } from '@nestjs/common';
import { OptionsInterface } from '@concepta/ts-core';
import { CrudValidationOptions } from '../crud.types';

export interface CrudValidationMetadataInterface extends OptionsInterface {
  propertyKey: string | symbol;
  parameterIndex: number;
  validation: CrudValidationOptions | undefined;
  pipes: Parameters<typeof Body>[1][] | [];
}
