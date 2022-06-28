import { OtpInterface } from './otp.interface';

export interface OtpUpdatableInterface
  extends Pick<OtpInterface, 'category' | 'type' | 'passcode' | 'assignee'> {}
