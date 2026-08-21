import { UserEntityInterface } from '@concepta/nestjs-user';
import { RocketsAuthUserMetadataEntityInterface } from './rockets-auth-user-metadata-entity.interface';

export interface RocketsAuthUserEntityInterface extends UserEntityInterface {
  userMetadata?: RocketsAuthUserMetadataEntityInterface | null;
}
