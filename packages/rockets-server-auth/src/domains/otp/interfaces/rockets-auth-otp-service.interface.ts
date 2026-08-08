import { ReferenceIdInterface } from '@concepta/nestjs-core';
import type { PlainLiteralObject } from '@nestjs/common';

export interface RocketsAuthOtpServiceInterface {
  sendOtp(ctx: PlainLiteralObject, email: string): Promise<void>;

  confirmOtp(
    ctx: PlainLiteralObject,
    email: string,
    passcode: string,
  ): Promise<ReferenceIdInterface>;
}
