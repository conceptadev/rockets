import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class EntityNotFoundException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(
    entityName: string,
    message = 'Entity %s was not registered to be used.',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      messageParams: [entityName],
      ...options,
    });
    this.context = {
      ...super.context,
      entityName,
    };
    this.errorCode = 'OTP_ENTITY_NOT_FOUND_ERROR';
  }
}
