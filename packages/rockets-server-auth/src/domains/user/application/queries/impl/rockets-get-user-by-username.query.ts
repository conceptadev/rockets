import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsGetUserByUsernameQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly username: string,
  ) {}
}
