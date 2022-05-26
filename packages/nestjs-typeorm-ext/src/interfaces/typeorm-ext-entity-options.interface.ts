import { EntitySchema, Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';

export interface TypeOrmExtEntityOptionInterface<T> {
  entity: Type<T> | EntitySchema<T>;
  repository?: Type<Repository<T>>;
  connection?: TypeOrmExtConnectionToken;
}
