import { EntitySchema, Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';
import { ReferenceIdInterface } from '@concepta/ts-core';

export interface TypeOrmExtEntityOptionInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  entity: Type<T> | EntitySchema<T>;
  repository?: Type<Repository<T>>;
  connection?: TypeOrmExtConnectionToken;
}
