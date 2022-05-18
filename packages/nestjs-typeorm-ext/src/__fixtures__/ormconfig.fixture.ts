import { ConnectionOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PhotoEntityFixture } from './photo/photo.entity.fixture';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [PhotoEntityFixture],
};

export default config;
