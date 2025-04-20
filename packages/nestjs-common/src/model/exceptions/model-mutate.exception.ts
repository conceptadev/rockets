import { RuntimeException } from '../../exceptions/runtime.exception';
import { RuntimeExceptionOptions } from '../../exceptions/interfaces/runtime-exception-options.interface';

export class ModelMutateException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: 'Error while trying to mutate a %s model',
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = 'MODEL_MUTATE_ERROR';
  }
}
