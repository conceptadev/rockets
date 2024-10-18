import {
  RuntimeException,
  RuntimeExceptionOptions,
} from '@concepta/nestjs-exception';

export class OtpTypeNotDefinedException extends RuntimeException {
  context: {
    type: string;
  };

  constructor(
    type: string,
    message = 'Type %s was not defined to be used. please check config.',
    options?: RuntimeExceptionOptions,
  ) {
    super({
      message,
      messageParams: [type],
      ...options,
    });
    this.context = {
      ...super.context,
      type,
    };
    this.errorCode = 'OTP_TYPE_NOT_DEFINED_ERROR';
  }
}
