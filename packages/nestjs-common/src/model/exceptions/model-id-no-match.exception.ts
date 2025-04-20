import { ReferenceId } from '../../reference/interfaces/reference.types';
import { RuntimeException } from '../../exceptions/runtime.exception';
import { RuntimeExceptionOptions } from '../../exceptions/interfaces/runtime-exception-options.interface';

export class ModelIdNoMatchException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
    id: ReferenceId;
  };

  constructor(
    entityName: string,
    id: ReferenceId,
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message: 'No match for %s model id %s.',
      messageParams: [entityName, id],
      ...options,
    });

    this.errorCode = 'MODEL_ID_NO_MATCH';

    this.context = {
      ...super.context,
      entityName,
      id,
    };
  }
}
