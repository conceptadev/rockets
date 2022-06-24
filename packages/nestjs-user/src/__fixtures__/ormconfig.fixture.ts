import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';
import { UserEntityFixture } from './user.entity.fixture';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntityFixture],
  defaultSeeder: 'NONE',
};

export default config;
