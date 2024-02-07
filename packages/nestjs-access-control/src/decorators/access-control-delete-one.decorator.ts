import { AccessControlGrant } from './access-control-grant.decorator';
import { applyDecorators } from '@nestjs/common';
import { ActionEnum } from '../enums/action.enum';

/**
 * Delete one resource grant shortcut
 *
 * @param string resource The grant resource.
 * @returns {ReturnType<typeof applyDecorators>} Decorator function
 */
export const AccessControlDeleteOne = (
  resource: string,
): ReturnType<typeof applyDecorators> =>
  AccessControlGrant({
    resource: resource,
    action: ActionEnum.DELETE,
  });
