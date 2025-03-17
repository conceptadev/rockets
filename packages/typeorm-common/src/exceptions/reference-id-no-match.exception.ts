import { ReferenceId } from '@concepta/nestjs-common';
import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { t } from '@concepta/i18n';
import { REFERENCE_ID_NO_MATCH } from '../constants';

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
      message: t({
        key: REFERENCE_ID_NO_MATCH,
        defaultMessage: 'No match for %s reference id %s.',
      }),
      messageParams: [entityName, id],
      ...options,
    });

    this.errorCode = REFERENCE_ID_NO_MATCH;

    this.context = {
      ...super.context,
      entityName,
      id,
    };
  }
}
