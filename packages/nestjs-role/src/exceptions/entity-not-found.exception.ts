import { HttpStatus } from '@nestjs/common';
import { RuntimeException } from '@concepta/nestjs-exception';

export class EntityNotFoundException extends RuntimeException {
  constructor(entityName: string) {
    super({
      message: 'Entity %s was not registered to be used.',
      messageParams: [entityName],
      httpStatus: HttpStatus.NOT_FOUND,
    });

    this.errorCode = 'ROLE_ENTITY_NOT_FOUND_ERROR';
    this.context = {
      entityName,
    };
  }
}
