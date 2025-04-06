import { LiteralObject } from '@concepta/nestjs-common';
import { OtpTypeServiceInterface } from './otp-type-service.interface';

export interface OtpSettingsInterface {
  types: LiteralObject<OtpTypeServiceInterface>;
  clearOnCreate: boolean;

  /**
   * Number of days to retain OTP history. When set, OTPs will be marked inactive instead of deleted.
   * If undefined, OTPs will be permanently deleted rather than retained.
   */
  keepHistoryDays?: number;

  /**
   * The minimum number of seconds that must pass between OTP generation requests.
   * This helps prevent abuse by rate limiting how frequently new OTPs can be created.
   */
  rateSeconds?: number;

  /**
   * How many attempts before the user is blocked within the rateSeconds time window.
   * For example, if rateSeconds is 60 and rateThreshold is 3, the user will be blocked
   * after 3 failed attempts within 60 seconds.
   */
  rateThreshold?: number;
}
