import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export type TypeOrmExtOptions = TypeOrmModuleOptions;

export type TypeOrmExtConnectionToken = DataSource | DataSourceOptions | string;
