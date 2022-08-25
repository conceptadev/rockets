import { ExceptionInterface } from '@concepta/ts-core';

export class InvitationSettingsOtpNotFoundException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'INVITATION_SETTINGS_OTP_NOT_FOUND_ERROR';

  constructor(message = 'settings opt assigment was not defined') {
    super(message);
  }
}
