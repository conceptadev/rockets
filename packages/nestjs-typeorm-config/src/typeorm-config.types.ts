import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type TypeOrmConfigOptions = TypeOrmModuleOptions;

export type TypeOrmConfigEntitiesValues = [TypeOrmConfigOptions['entities']];

export type TypeOrmConfigSubscribersValues = [
  TypeOrmConfigOptions['subscribers'],
];
