import { applyDecorators } from '@nestjs/common';

export interface ConfigurableCrudDecorators {
  CrudController: ReturnType<typeof applyDecorators>;
  CrudGetMany: ReturnType<typeof applyDecorators>;
  CrudGetOne: ReturnType<typeof applyDecorators>;
  CrudCreateMany: ReturnType<typeof applyDecorators>;
  CrudCreateOne: ReturnType<typeof applyDecorators>;
  CrudUpdateOne: ReturnType<typeof applyDecorators>;
  CrudReplaceOne: ReturnType<typeof applyDecorators>;
  CrudDeleteOne: ReturnType<typeof applyDecorators>;
  CrudRecoverOne: ReturnType<typeof applyDecorators>;
}
