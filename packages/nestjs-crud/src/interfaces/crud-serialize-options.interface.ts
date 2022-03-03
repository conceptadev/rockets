import { Type } from '@nestjs/common';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { ClassTransformOptions } from 'class-transformer';

export interface CrudSerializeOptionsInterface extends OptionsInterface {
  type?: Type;
  manyType?: Type;
  toInstanceOptions?: ClassTransformOptions;
  toPlainOptions?: ClassTransformOptions;
}
