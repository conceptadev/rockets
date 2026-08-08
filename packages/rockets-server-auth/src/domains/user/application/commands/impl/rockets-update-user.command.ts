import { UserEntityInterface } from '@concepta/nestjs-user';
import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsUpdateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: string,
    public readonly data: Partial<UserEntityInterface>,
  ) {}
}
