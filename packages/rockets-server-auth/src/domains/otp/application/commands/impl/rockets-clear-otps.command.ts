import { ReferenceAssignment } from '@concepta/nestjs-core';
import { OtpInterface } from '@concepta/nestjs-otp';
import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsClearOtpsCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly assignment: ReferenceAssignment,
    public readonly otp: Pick<OtpInterface, 'assigneeId' | 'category'>,
  ) {}
}
