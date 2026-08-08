import { RocketsAuthUserMetadataEntityInterface } from '../../interfaces/rockets-auth-user-metadata-entity.interface';
import { RocketsAuthUserMetadataUpdatableInterface } from '../../interfaces/rockets-auth-user-metadata-updatable.interface';
import type { PlainLiteralObject } from '@nestjs/common';

export interface UserMetadataRepositoryInterface {
  findByUserId(
    ctx: PlainLiteralObject,
    userId: string,
  ): Promise<RocketsAuthUserMetadataEntityInterface | null>;

  save(
    ctx: PlainLiteralObject,
    userId: string,
    data: RocketsAuthUserMetadataUpdatableInterface,
  ): Promise<RocketsAuthUserMetadataEntityInterface>;
}
