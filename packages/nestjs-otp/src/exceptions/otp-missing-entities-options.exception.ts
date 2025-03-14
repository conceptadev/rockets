import { OtpException } from './otp.exception';

export class OtpMissingEntitiesOptionsException extends OtpException {
  constructor() {
    super({
      message: 'You must provide the entities option',
    });
    this.errorCode = 'OTP_MISSING_ENTITIES_OPTION';
  }
}
