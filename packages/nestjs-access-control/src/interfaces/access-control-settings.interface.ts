import { AccessControl } from 'accesscontrol';
import { OptionsInterface } from '@concepta/ts-core';

export interface AccessControlSettingsInterface extends OptionsInterface {
  rules: AccessControl;
}
