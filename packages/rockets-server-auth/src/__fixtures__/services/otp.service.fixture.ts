import { ReferenceIdInterface } from '@concepta/nestjs-core';
import { Injectable, type PlainLiteralObject } from '@nestjs/common';
import { RocketsAuthOtpServiceInterface } from '../../domains/otp/interfaces/rockets-auth-otp-service.interface';

@Injectable()
export class OtpServiceFixture implements RocketsAuthOtpServiceInterface {
  async sendOtp(_ctx: PlainLiteralObject, _email: string): Promise<void> {
    // In a fixture, we don't need to actually send an email
    return Promise.resolve();
  }

  async confirmOtp(
    _ctx: PlainLiteralObject,
    _email: string,
    passcode: string,
  ): Promise<ReferenceIdInterface> {
    // For fixture purposes, we'll validate against our hardcoded passcode
    if (passcode === 'GOOD_PASSCODE') {
      return { id: 'abc' };
    }
    throw new Error('Invalid OTP');
  }
}
