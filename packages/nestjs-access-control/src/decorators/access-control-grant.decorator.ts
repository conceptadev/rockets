import { SetMetadata } from '@nestjs/common';
import { AccessControlGrantOption } from '../interfaces/access-control-grant-option.interface';
import { ACCESS_CONTROL_GRANT_CONFIG_KEY } from '../constants';

/**
 * Define access control filters required for this route.
 *
 * @param {AccessControlGrantOption[]} acFilters Array of access control filters.
 * @returns {ReturnType<typeof SetMetadata>} Decorator function.
 */
export const AccessControlGrant = (
  ...acFilters: AccessControlGrantOption[]
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_GRANT_CONFIG_KEY, acFilters);
};
