import { SetMetadata } from '@nestjs/common';
import { ROCKETS_DISABLE_GUARDS_TOKEN } from '../rockets-core.constants';

export interface AuthPublicOptions {
  classLevel?: boolean;
}

export type AuthPublicMetadata = true | 'classLevel';

export const AuthPublic = (options?: AuthPublicOptions) =>
  SetMetadata(
    ROCKETS_DISABLE_GUARDS_TOKEN,
    options?.classLevel ? 'classLevel' : true,
  );
