import { SetMetadata } from '@nestjs/common';
import { AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN } from '../authentication.constants';

/**
 * Disable ONLY AuthGuards that have the `canDisable` option set to true.
 */
export const AuthPublic = () =>
  SetMetadata(AUTHENTICATION_MODULE_DISABLE_GUARDS_TOKEN, true);
