import { ReferenceIdInterface } from '@concepta/nestjs-core';
import { UserInterface } from '@concepta/nestjs-user';
import { RocketsAuthUserMetadataEntityInterface } from './rockets-auth-user-metadata-entity.interface';

export interface RocketsAuthUserInterface
  extends UserInterface,
    ReferenceIdInterface {
  userMetadata?:
    | Record<string, unknown>
    | RocketsAuthUserMetadataEntityInterface;
}
