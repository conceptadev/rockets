import { OptionsInterface } from '@rockts-org/nestjs-common';
import {
  TypeOrmExtStorableEntity,
  TypeOrmExtStorableRepository,
  TypeOrmExtStorableSubscriber,
} from '../typeorm-ext.types';
import { TypeOrmExtMetadataItemsInterface } from './typeorm-ext-metadata-items.interface';

export interface TypeOrmExtMetadataInterface extends OptionsInterface {
  entities?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableEntity>;
  repositories?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableRepository>;
  subscribers?: TypeOrmExtMetadataItemsInterface<TypeOrmExtStorableSubscriber>;
}
