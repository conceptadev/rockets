import { AccessControl } from 'accesscontrol';
import { OptionsInterface } from '@concepta/nestjs-common';

export interface AccessControlSettingsInterface extends OptionsInterface {
  rules: AccessControl;
}
