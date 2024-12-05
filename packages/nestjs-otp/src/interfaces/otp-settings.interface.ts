import { LiteralObject } from '@concepta/nestjs-common';
import { OtpTypeServiceInterface } from './otp-types-service.interface';

export interface OtpSettingsInterface {
  types: LiteralObject<OtpTypeServiceInterface>;
}
