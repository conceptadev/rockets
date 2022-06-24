import { Connection, ConnectionOptions } from 'typeorm';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export type TypeOrmExtOptions = TypeOrmModuleOptions &
  Pick<TypeOrmModuleAsyncOptions, 'name'>;

export type TypeOrmExtConnectionToken = Connection | ConnectionOptions | string;
