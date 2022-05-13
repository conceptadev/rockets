import { Type } from '@nestjs/common';
import { OptionsInterface } from '@concepta/ts-core';
import { ClassTransformOptions } from 'class-transformer';

export interface CrudSerializationOptionsInterface extends OptionsInterface {
  type?: Type;
  paginatedType?: Type;
  toInstanceOptions?: ClassTransformOptions;
  toPlainOptions?: ClassTransformOptions;
}
