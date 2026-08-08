import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsGetRoleByNameQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly name: string,
  ) {}
}
