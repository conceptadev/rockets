import { OptionsInterface } from '@concepta/ts-core';

export interface RoleSettingsInterface extends OptionsInterface {
  assignments: { [idx: string]: { entityKey: string } };
}
