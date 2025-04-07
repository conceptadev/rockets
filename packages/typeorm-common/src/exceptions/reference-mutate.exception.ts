import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-common';

export class ReferenceMutateException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to mutate a %s reference',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = 'REFERENCE_MUTATE_ERROR';
  }
}
