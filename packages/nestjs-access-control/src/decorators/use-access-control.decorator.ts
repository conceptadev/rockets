import { SetMetadata } from '@nestjs/common';
import { AccessControlMetadataInterface } from '../interfaces/access-control-metadata.interface';
import { ACCESS_CONTROL_MODULE_CTLR_METADATA } from '../constants';

/**
 * Define access control filters required for this route.
 *
 * @param options Access control options.
 * @returns Decorator function.
 */
export const UseAccessControl = (
  options: AccessControlMetadataInterface = {},
): ReturnType<typeof SetMetadata> => {
  return SetMetadata(ACCESS_CONTROL_MODULE_CTLR_METADATA, options);
};
