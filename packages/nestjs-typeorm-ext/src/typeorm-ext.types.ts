import { ConnectionOptions, EntitySchema } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TypeOrmExtMetadataInterface } from './interfaces/typeorm-ext-metadata.interface';

export type TypeOrmExtOptions = TypeOrmModuleOptions;

export type TypeOrmExtConnectionToken = ConnectionOptions | string;

export type TypeOrmExtStorableEntity = Type | EntitySchema;

export type TypeOrmExtStorableRepository = Type;

export type TypeOrmExtStorableSubscriber = Type;

export type TypeOrmExtMetadataOptions = TypeOrmExtMetadataInterface & {
  connection?: string;
};
