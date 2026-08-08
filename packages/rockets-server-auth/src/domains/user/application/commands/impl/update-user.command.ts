import type { PlainLiteralObject } from '@nestjs/common';
import { ReferenceId } from '@concepta/nestjs-core';
import { RocketsAuthUserUpdatableInterface } from '../../../interfaces/rockets-auth-user-updatable.interface';

export class UpdateUserCommand {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
    public readonly dto: RocketsAuthUserUpdatableInterface,
  ) {}
}
