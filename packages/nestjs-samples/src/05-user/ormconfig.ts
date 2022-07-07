import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './user/user.entity';

const config: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: ':memory:',
  synchronize: true,
  entities: [UserEntity],
};

export default config;
