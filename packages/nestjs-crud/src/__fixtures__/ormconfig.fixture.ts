import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';
import { PhotoFixture } from './photo/photo.entity.fixture';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [PhotoFixture],
  defaultSeeder: './photo/photo-seeder',
};

export default config;
