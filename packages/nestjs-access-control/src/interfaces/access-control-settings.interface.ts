import { AccessControl } from 'accesscontrol';
import { OptionsInterface } from '@rockts-org/nestjs-common';

export interface AccessControlSettingsInterface extends OptionsInterface {
  rules: AccessControl;
}
