import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { t } from '@concepta/i18n';
import { REFERENCE_LOOKUP_ERROR } from '../constants';

export class ReferenceLookupException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: t({
        key: REFERENCE_LOOKUP_ERROR,
        defaultMessage: 'Error while trying to lookup a %s reference',
      }),
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = REFERENCE_LOOKUP_ERROR;
  }
}
