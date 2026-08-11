import type { PlainLiteralObject } from '@nestjs/common';

export class RocketsGetRolesByIdsQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly ids: readonly string[],
  ) {}
}
