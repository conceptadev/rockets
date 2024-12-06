import { LiteralObject } from '@concepta/nestjs-common';

export interface CacheSettingsInterface {
  assignments: LiteralObject<{ entityKey: string }>;
  expiresIn?: string | undefined | null;
}
