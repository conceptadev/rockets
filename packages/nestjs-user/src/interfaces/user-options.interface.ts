import { Type } from '@nestjs/common';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmExtMetadataOptions } from '@rockts-org/nestjs-typeorm-ext';
import { Repository } from 'typeorm';
import { UserServiceInterface } from './user-service.interface';
import { UserSettingsInterface } from './user-settings.interface';
import { UserInterface } from './user.interface';

export interface UserOptionsInterface extends OptionsInterface {
  settings?: UserSettingsInterface;
  userService?: UserServiceInterface;
}

export interface UserOrmFeatureOptionsInterface
  extends TypeOrmExtMetadataOptions {
  entities?: {
    user?: { useClass?: Type<UserInterface> };
  };
  repositories?: {
    userRepository?: { useClass?: Type<Repository<UserInterface>> };
  };
}

export interface UserOrmConfigInterface extends OptionsInterface {
  orm?: UserOrmFeatureOptionsInterface;
}
