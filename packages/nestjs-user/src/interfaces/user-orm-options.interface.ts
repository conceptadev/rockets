import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtOrmOptionsInterface } from '@concepta/nestjs-typeorm-ext';
import { UserEntityInterface } from './user-entity.interface';

export interface UserOrmOptionsInterface extends TypeOrmExtOrmOptionsInterface {
  orm?: {
    entities?: {
      user?: { useClass?: Type<UserEntityInterface> };
    };
    repositories?: {
      userRepository?: { useClass?: Type<Repository<UserEntityInterface>> };
    };
  };
}
