import {
  Injectable,
  Inject,
  ValidationPipe,
  ValidationPipeOptions,
  ArgumentMetadata,
  PipeTransform,
  Optional,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CRUD_MODULE_CRUD_VALIDATION_KEY } from '../crud.constants';
import { CrudReflectionHelper } from '../util/crud-reflection.helper';

@Injectable()
export class CrudValidationPipe implements PipeTransform<unknown> {
  @Inject(REQUEST) private req;

  private reflectionHelper = new CrudReflectionHelper();
  private validationPipe: ValidationPipe;

  constructor(@Optional() private options: ValidationPipeOptions) {}

  async transform(
    value: unknown,
    metadata: ArgumentMetadata,
  ): Promise<unknown> {
    const mergedOptions = this.reflectionHelper.mergeValidationOptions(
      this.options,
      this.req[CRUD_MODULE_CRUD_VALIDATION_KEY]
        ? this.req[CRUD_MODULE_CRUD_VALIDATION_KEY]
        : {},
    );

    if (mergedOptions) {
      if (!this.validationPipe) {
        this.validationPipe = new ValidationPipe(mergedOptions ?? {});
      }
      return this.validationPipe.transform(value, metadata);
    } else {
      return value;
    }
  }
}
