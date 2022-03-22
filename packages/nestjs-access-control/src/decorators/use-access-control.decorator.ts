import { SetMetadata } from '@nestjs/common';
import { AccessControlOptions } from '../interfaces/access-control-options.interface';
import { ACCESS_CONTROL_MODULE_CTLR_METADATA } from '../constants';

/**
 * Define access control filters required for this route.
 *
 * @param {AccessControlOptions} options Access control options.
 * @returns {ReturnType<typeof SetMetadata>} Decorator function.
 */
export const UseAccessControl = (
  options: AccessControlOptions = {},
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_MODULE_CTLR_METADATA, options);
};
