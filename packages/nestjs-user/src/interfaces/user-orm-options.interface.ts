import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';
import { TypeOrmExtOrmOptionsInterface } from '@rockts-org/nestjs-typeorm-ext';
import { UserInterface } from './user.interface';

export interface UserOrmOptionsInterface extends TypeOrmExtOrmOptionsInterface {
  orm?: {
    entities?: {
      user?: { useClass?: Type<UserInterface> };
    };
    repositories?: {
      userRepository?: { useClass?: Type<Repository<UserInterface>> };
    };
  };
}
