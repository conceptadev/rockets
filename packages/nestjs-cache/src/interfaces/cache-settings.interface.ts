import { LiteralObject } from '@concepta/ts-core';

export interface CacheSettingsInterface {
  assignments: LiteralObject<{ entityKey: string }>;
  expiresIn?: string | undefined;
}
