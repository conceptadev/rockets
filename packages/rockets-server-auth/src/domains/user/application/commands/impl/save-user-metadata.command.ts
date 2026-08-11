import type { PlainLiteralObject } from '@nestjs/common';
import { ReferenceId } from '@concepta/nestjs-core';
import { RocketsAuthUserMetadataUpdatableInterface } from '../../../interfaces/rockets-auth-user-metadata-updatable.interface';

export class SaveUserMetadataCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly data: RocketsAuthUserMetadataUpdatableInterface,
  ) {}
}
