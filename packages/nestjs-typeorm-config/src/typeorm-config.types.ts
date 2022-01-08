import { ConnectionOptions, EntitySchema } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmConfigMetaDataInterface } from './interfaces/typeorm-config-metadata.interface';

export type TypeOrmConfigOptions = TypeOrmModuleOptions;

export type TypeOrmConfigSubscribersValues = [
  TypeOrmConfigOptions['subscribers'],
];

export type TypeOrmConfigConnectionToken = ConnectionOptions | string;

export type TypeOrmConfigStorableEntity = Type | EntitySchema;

export type TypeOrmConfigStorableRepo = Type;

export type TypeOrmConfigStorableSubscriber = Type;

export type TypeOrmConfigMetaDataOptions = TypeOrmConfigMetaDataInterface & {
  connection?: string;
};
