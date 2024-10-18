import { ReferenceId } from '@concepta/ts-core';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class ReferenceIdNoMatchException extends RuntimeException {
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
      message: 'No match for %s reference id %s.',
      messageParams: [entityName, id],
      ...options,
    });

    this.errorCode = 'REFERENCE_ID_NO_MATCH';

    this.context = {
      ...super.context,
      entityName,
      id,
    };
  }
}
