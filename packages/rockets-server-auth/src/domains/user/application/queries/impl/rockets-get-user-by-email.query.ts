import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsGetUserByEmailQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: string,
  ) {}
}
