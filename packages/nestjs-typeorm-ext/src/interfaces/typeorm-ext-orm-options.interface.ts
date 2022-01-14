import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmExtMetadataInterface } from './typeorm-ext-metadata.interface';

export interface TypeOrmExtOrmOptionsInterface extends OptionsInterface {
  orm?: TypeOrmExtMetadataInterface;
}
