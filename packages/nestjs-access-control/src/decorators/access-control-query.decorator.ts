import { SetMetadata } from '@nestjs/common';
import { AccessControlQueryOptionInterface } from '../interfaces/access-control-query-option.interface';
import { ACCESS_CONTROL_MODULE_QUERY_METADATA } from '../constants';

/**
 * Define access query options for this route.
 *
 * @param {AccessControlQueryOptionInterface[]} queryOptions Array of access control query options.
 * @returns {ReturnType<typeof SetMetadata>} Decorator function.
 */
export const AccessControlQuery = (
  ...queryOptions: AccessControlQueryOptionInterface[]
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_MODULE_QUERY_METADATA, queryOptions);
};
