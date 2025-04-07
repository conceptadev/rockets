import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-common';
import { CacheException } from './cache.exception';

export class CacheEntityAlreadyExistsException extends CacheException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(
    entityName: string,
    message = '%s already exists with the given key, type, and assignee ID.',
  ) {
    super({
      httpStatus: HttpStatus.BAD_REQUEST,
      message,
      messageParams: [entityName],
    });

    this.errorCode = 'CACHE_ENTITY_ALREADY_EXISTS_ERROR';

    this.context = {
      ...super.context,
      entityName,
    };
  }
}
