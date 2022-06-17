import { format } from 'util';
import { ExceptionInterface } from '@concepta/ts-core';

export class OtpTypeNotDefinedException
  extends Error
  implements ExceptionInterface
{
  errorCode = 'OTP_TYPE_NOT_DEFINED_ERROR';

  context: {
    type: string;
  };

  constructor(
    type: string,
    message = 'Type %s was not defined to be used. please check config.',
  ) {
    super(format(message, type));
    this.context = {
      type,
    };
  }
}
