import { AccessControlGrant } from './access-control-grant.decorator';
import { ActionEnum } from '../enums/action.enum';
import { applyDecorators } from '@nestjs/common';

/**
 * Create one resource grant shortcut.
 *
 * @param string resource The grant resource.
 * @returns {ReturnType<typeof applyDecorators>} Decorator function
 */
export const AccessControlCreateOne = (
  resource: string,
): ReturnType<typeof applyDecorators> =>
  AccessControlGrant({
    resource: resource,
    action: ActionEnum.CREATE,
  });
