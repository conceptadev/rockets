import {SetMetadata} from '@nestjs/common';
import {AccessControlFilterOption} from '../interfaces/access-control-filter-option.interface';
import {ACCESS_CONTROL_FILTERS_CONFIG_KEY} from '../constants';

/**
 * Define access filters required for this route.
 */
export const AccessControlFilter = (
  ...acFilters: AccessControlFilterOption[]
) => {
  return SetMetadata(ACCESS_CONTROL_FILTERS_CONFIG_KEY, acFilters);
};
