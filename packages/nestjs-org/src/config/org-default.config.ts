import { OrgOptionsInterface } from '../interfaces/org-options.interface';
import { registerAs } from '@nestjs/config';
import { ORG_MODULE_DEFAULT_SETTINGS_TOKEN } from '../org.constants';

/**
 * Default configuration for Org module.
 */
export const orgDefaultConfig = registerAs(
  ORG_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): OrgOptionsInterface => ({}),
);
