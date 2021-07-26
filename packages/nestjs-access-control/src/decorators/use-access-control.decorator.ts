import { SetMetadata } from '@nestjs/common';
import { AccessControlOptions } from '../interfaces/access-control-options.interface';
import { ACCESS_CONTROL_CTLR_CONFIG_KEY } from '../constants';

/**
 * Define access control filters required for this route.
 */
export const UseAccessControl = (
  options: AccessControlOptions = {},
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_CTLR_CONFIG_KEY, options);
};
