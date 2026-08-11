import { UserEntityInterface } from '@concepta/nestjs-user';
import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsCreateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly data: Partial<UserEntityInterface>,
  ) {}
}
