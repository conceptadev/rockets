import {SetMetadata} from '@nestjs/common';
import {AccessControlGrantOption} from '../interfaces/access-control-grant-option.interface';
import {ACCESS_CONTROL_GRANT_CONFIG_KEY} from '../constants';

/**
 * Define access control filters required for this route.
 */
export const AccessControlGrant = (
  ...acFilters: AccessControlGrantOption[]
) => {
  return SetMetadata(ACCESS_CONTROL_GRANT_CONFIG_KEY, acFilters);
};
