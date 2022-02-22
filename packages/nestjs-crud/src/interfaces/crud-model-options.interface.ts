import { Type } from '@nestjs/common';
import { ModelOptions } from '@nestjsx/crud';

export interface CrudModelOptionsInterface extends ModelOptions {
  type: Type;
  manyType?: Type;
}
