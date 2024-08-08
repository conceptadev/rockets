import { format } from 'util';
import { ReferenceId, ExceptionInterface } from '@concepta/ts-core';
import { t } from '@concepta/i18n';
import { REFERENCE_ID_NO_MATCH } from '../constants';

export class ReferenceIdNoMatchException
  extends Error
  implements ExceptionInterface
{
  errorCode = REFERENCE_ID_NO_MATCH;

  context: {
    entityName: string;
    id: ReferenceId;
  };

  constructor(
    entityName: string,
    id: ReferenceId,
    message?: string,
  ) {
    super(format(message
      ?? t({
        key: REFERENCE_ID_NO_MATCH,
        defaultMessage: 'No match for %s reference id %s.'
      })
    , entityName, id));
    this.context = {
      entityName,
      id,
    };
  }
}
