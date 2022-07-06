import { Connection, ConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type TypeOrmExtOptions = TypeOrmModuleOptions;

export type TypeOrmExtConnectionToken = Connection | ConnectionOptions | string;
