import { SetMetadata } from '@nestjs/common';
import { AccessControlGrantOption } from '../interfaces/access-control-grant-option.interface';
import { ACCESS_CONTROL_MODULE_GRANT_METADATA } from '../constants';

/**
 * Define access control filters required for this route.
 *
 * @param {AccessControlGrantOption[]} acFilters Array of access control filters.
 * @returns {ReturnType<typeof SetMetadata>} Decorator function.
 */
export const AccessControlGrant = (
  ...acFilters: AccessControlGrantOption[]
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_MODULE_GRANT_METADATA, acFilters);
};
