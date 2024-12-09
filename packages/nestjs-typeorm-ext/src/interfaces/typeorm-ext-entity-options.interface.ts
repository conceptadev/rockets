import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { DataSource, Repository } from 'typeorm';
import { TypeOrmExtDataSourceToken } from '../typeorm-ext.types';

export interface TypeOrmExtEntityOptionInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
> {
  entity: EntityClassOrSchema;
  repositoryFactory?: (dataSource: DataSource) => Repository<T>;
  dataSource?: TypeOrmExtDataSourceToken;
}
