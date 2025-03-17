import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';
import { t } from '@concepta/i18n';
import { REFERENCE_MUTATE_ERROR } from '../constants';

export class ReferenceMutateException extends RuntimeException {
  context: RuntimeException['context'] & {
    entityName: string;
  };

  constructor(entityName: string, options?: RuntimeExceptionOptions) {
    super({
      message: t({
        key: REFERENCE_MUTATE_ERROR,
        defaultMessage: 'Error Default while trying to mutate a %s reference',
      }),
      messageParams: [entityName],
      ...options,
    });

    this.context = {
      ...super.context,
      entityName,
    };

    this.errorCode = REFERENCE_MUTATE_ERROR;
  }
}
