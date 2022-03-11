import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';
import { Photo } from './photo/photo.entity';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [Photo],
  defaultSeeder: './photo/photo-seeder',
};

export default config;
