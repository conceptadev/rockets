import { AccessControlGrant } from './access-control-grant.decorator';
import { AccessControlFilterCallback } from '../interfaces/access-control-filter-option.interface';
import { applyDecorators } from '@nestjs/common';
import { AccessControlFilter } from './access-control-filter.decorator';
import { AccessControlGrantResource } from '../interfaces/access-control-grant-option.interface';
import { AccessControlAction } from '../enums/access-control-action.enum';
import { AccessControlFilterType } from '../enums/access-control-filter-type.enum';

/**
 * Read many resource filter shortcut
 */
export const AccessControlReadMany = (
  resource: AccessControlGrantResource,
  paramFilter?: AccessControlFilterCallback
): ReturnType<typeof applyDecorators> => {
  const acFilter = AccessControlGrant({
    resource: resource,
    action: AccessControlAction.READ,
  });

  if (paramFilter) {
    return applyDecorators(
      acFilter,
      AccessControlFilter({
        type: AccessControlFilterType.QUERY,
        filter: paramFilter,
      })
    );
  } else {
    return acFilter;
  }
};
