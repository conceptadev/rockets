import {
  Connection,
  ConnectionOptions,
  EntitySchema,
  Repository,
} from 'typeorm';
import { Type } from '@nestjs/common';

export interface TypeOrmExtEntityOptionInterface<T> {
  entity: Type<T> | EntitySchema<T>;
  repository?: Type<Repository<T>>;
  connection?: Connection | ConnectionOptions | string;
}
