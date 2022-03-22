import { Body } from '@nestjs/common';
import { OptionsInterface } from '@concepta/nestjs-common';
import { CrudValidationOptions } from '../crud.types';

export interface CrudBodyOptionsInterface extends OptionsInterface {
  validation?: CrudValidationOptions;
  pipes?: Parameters<typeof Body>[1][];
}
