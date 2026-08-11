import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsGetUserByIdQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: string,
  ) {}
}
