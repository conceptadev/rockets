import { OtpTypeServiceInterface } from './otp-types-service.interface';

export interface OtpSettingsInterface {
  /**
   * Expressed in seconds or a string describing a time span [zeit/ms](https://github.com/zeit/ms.js).
   *
   * Eg: 60, "2 days", "10h", "7d"
   */
  expiresIn: string;

  types: {
    [idx: string]: OtpTypeServiceInterface;
  };
}
