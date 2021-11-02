import { SetMetadata } from '@nestjs/common';
import { AccessControlFilterOption } from '../interfaces/access-control-filter-option.interface';
import { ACCESS_CONTROL_FILTERS_CONFIG_KEY } from '../constants';

/**
 * Define access filters required for this route.
 *
 * @param {AccessControlFilterOption[]} acFilters Array of access control filters.
 * @returns {ReturnType<typeof SetMetadata>} Decorator function.
 */
export const AccessControlFilter = (
  ...acFilters: AccessControlFilterOption[]
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_FILTERS_CONFIG_KEY, acFilters);
};
