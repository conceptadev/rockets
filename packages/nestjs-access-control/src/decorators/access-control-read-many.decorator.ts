import { applyDecorators } from '@nestjs/common';
import { ActionEnum } from '../enums/action.enum';
import { AccessControlGrant } from './access-control-grant.decorator';

/**
 * Read many resource grant shortcut.
 *
 * @param string resource The grant resource.
 * @returns {ReturnType<typeof applyDecorators>} Decorator function
 */
export const AccessControlReadMany = (
  resource: string,
): ReturnType<typeof applyDecorators> =>
  AccessControlGrant({
    resource: resource,
    action: ActionEnum.READ,
  });
