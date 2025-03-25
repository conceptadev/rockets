import { EmailSendOptionsInterface } from '@concepta/nestjs-common';
import { AuthVerifyEmailParamsInterface } from './auth-verify-email-params.interface';

export interface AuthVerifyNotificationServiceInterface {
  sendEmail(sendMailOptions: EmailSendOptionsInterface): Promise<void>;
  sendVerifyEmail(params: AuthVerifyEmailParamsInterface): Promise<void>;
}
