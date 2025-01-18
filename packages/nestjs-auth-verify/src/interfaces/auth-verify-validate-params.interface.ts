import { AuthVerifyConfirmParamsInterface } from './auth-verify-confirm-params.interface';

export interface AuthVerifyValidateParamsInterface
  extends AuthVerifyConfirmParamsInterface {
  deleteIfValid?: boolean;
}
