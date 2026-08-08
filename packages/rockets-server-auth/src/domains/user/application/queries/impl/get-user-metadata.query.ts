import type { PlainLiteralObject } from '@nestjs/common';

export class GetUserMetadataQuery {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: string,
  ) {}
}
