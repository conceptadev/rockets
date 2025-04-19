import { RuntimeException } from '../../exceptions/runtime.exception';
import { RuntimeExceptionOptions } from '../../exceptions/interfaces/runtime-exception-options.interface';

export class ReferenceLookupException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to lookup a %s reference',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = 'REFERENCE_LOOKUP_ERROR';
  }
}
