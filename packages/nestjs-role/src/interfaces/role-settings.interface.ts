import { LiteralObject } from '@concepta/ts-core';

export interface RoleSettingsInterface {
  assignments: LiteralObject<{ entityKey: string }>;
}
