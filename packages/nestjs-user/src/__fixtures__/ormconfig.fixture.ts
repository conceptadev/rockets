import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConnectionOptions } from '@jorgebodega/typeorm-seeding';

const config: TypeOrmModuleOptions & Partial<ConnectionOptions> = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
};

export default config;
