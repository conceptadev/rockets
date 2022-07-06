import { DataSource, Repository } from 'typeorm';
import { TypeOrmExtConnectionToken } from '../typeorm-ext.types';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';

export interface TypeOrmExtEntityOptionInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  entity: EntityClassOrSchema;
  repositoryFactory?: (dataSource: DataSource) => Repository<T>;
  connection?: TypeOrmExtConnectionToken;
}
