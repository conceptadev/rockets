import { ReferenceAssignment } from '@concepta/nestjs-core';
import { OtpInterface } from '@concepta/nestjs-otp';
import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsValidateOtpQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly assignment: ReferenceAssignment,
    public readonly otp: Pick<OtpInterface, 'category' | 'passcode'>,
    public readonly deleteIfValid: boolean,
  ) {}
}
