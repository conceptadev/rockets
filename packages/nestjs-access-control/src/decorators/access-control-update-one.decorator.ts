import { AccessControlGrant } from './access-control-grant.decorator';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { applyDecorators } from '@nestjs/common';
import { AccessControlFilter } from './access-control-filter.decorator';
import { AccessControlGrantResource } from '../interfaces/access-control-grant-option.interface';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';

/**
 * Update one resource filter shortcut
 *
 * @param {AccessControlGrantResource} resource The grant resource.
 * @param {AccessControlFilterCallback} paramFilter An optional param filter.
 * @returns {ReturnType<typeof applyDecorators>} Decorator function
 */
export const AccessControlUpdateOne = (
  resource: AccessControlGrantResource,
  paramFilter?: AccessControlFilterCallback,
): ReturnType<typeof applyDecorators> => {
  const acFilter = AccessControlGrant({
    resource: resource,
    action: AccessControlAction.UPDATE,
  });

  if (paramFilter) {
    return applyDecorators(
      acFilter,
      AccessControlFilter({
        type: AccessControlFilterType.PATH,
        filter: paramFilter,
      }),
    );
  } else {
    return acFilter;
  }
};
