import { OtpInterface } from './otp.interface';

export interface OtpCreatableInterface
  extends Pick<OtpInterface, 'category' | 'type' | 'assignee'> {
  expiresIn: string;
}
