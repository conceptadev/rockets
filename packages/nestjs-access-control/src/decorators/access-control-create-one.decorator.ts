import { AccessControlGrant } from './access-control-grant.decorator';
import { ActionEnum } from '../enums/action.enum';
import { applyDecorators } from '@nestjs/common';

/**
 * Create one resource grant shortcut.
 * @param resource - The grant resource.
 * @returns Decorator function
 */
export const AccessControlCreateOne = (
  resource: string,
): ReturnType<typeof applyDecorators> =>
  AccessControlGrant({
    resource: resource,
    action: ActionEnum.CREATE,
  });
