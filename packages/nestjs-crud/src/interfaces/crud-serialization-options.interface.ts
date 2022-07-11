import { Type } from '@nestjs/common';
import { ClassTransformOptions } from 'class-transformer';

export interface CrudSerializationOptionsInterface {
  type?: Type;
  paginatedType?: Type;
  toInstanceOptions?: ClassTransformOptions;
  toPlainOptions?: ClassTransformOptions;
}
