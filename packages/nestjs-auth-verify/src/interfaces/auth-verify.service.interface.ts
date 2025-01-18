import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { AuthVerifySendParamsInterface } from './auth-verify-send-params.interface';
import { AuthVerifyConfirmParamsInterface } from './auth-verify-confirm-params.interface';
import { AuthVerifyRevokeParamsInterface } from './auth-verify-revoke-params.interface';

export interface AuthVerifyServiceInterface {
  send(params: AuthVerifySendParamsInterface): Promise<void>;
  confirmUser(
    params: AuthVerifyConfirmParamsInterface,
  ): Promise<ReferenceIdInterface | null>;
  revokeAllUserVerifyToken(
    params: AuthVerifyRevokeParamsInterface,
  ): Promise<void>;
}
