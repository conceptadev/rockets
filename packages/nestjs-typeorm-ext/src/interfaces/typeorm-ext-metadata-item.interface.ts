import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

export interface TypeOrmExtMetadataItemInterface<T = unknown>
  extends OptionsInterface {
  useClass?: T;
  connection?: TypeOrmExtConnectionToken;
}
