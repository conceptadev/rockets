import { LiteralObject } from '@concepta/ts-core';
import { OtpTypeServiceInterface } from './otp-types-service.interface';

export interface OtpSettingsInterface {
  types: LiteralObject<OtpTypeServiceInterface>;
}
