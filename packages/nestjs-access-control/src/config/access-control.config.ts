import { registerAs } from '@nestjs/config';
import { AccessControlDefaultService } from '../access-control-default.service';
import { AccessControlOptions } from '../interfaces/access-control-options.interface';

/**
 * Get access control config from environment variables.
 */
export const accessControlConfig = registerAs(
  'ACCESS_CONTROL_CONFIG',
  (): AccessControlOptions => ({
    service: AccessControlDefaultService,
  }),
);

/**
 * The default access control config
 */
export const defaultAccessControl = accessControlConfig();
