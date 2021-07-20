import { AccessControlGrant } from './access-control-grant.decorator';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { applyDecorators } from '@nestjs/common';
import { AccessControlFilter } from './access-control-filter.decorator';
import { AccessControlGrantResource } from '../interfaces/access-control-grant-option.interface';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';

/**
 * Create one resource filter shortcut
 */
export const AccessControlCreateOne = (
  resource: AccessControlGrantResource,
  paramFilter?: AccessControlFilterCallback,
): ReturnType<typeof applyDecorators> => {
  const acFilter = AccessControlGrant({
    resource: resource,
    action: AccessControlAction.CREATE,
  });

  if (paramFilter) {
    return applyDecorators(
      acFilter,
      AccessControlFilter({
        type: AccessControlFilterType.BODY,
        filter: paramFilter,
      }),
    );
  } else {
    return acFilter;
  }
};
