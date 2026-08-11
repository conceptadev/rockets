import type { PlainLiteralObject } from '@nestjs/common';

export class AssignDefaultRoleCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: string,
  ) {}
}
