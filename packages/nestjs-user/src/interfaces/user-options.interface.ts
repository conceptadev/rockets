import { Type } from '@nestjs/common';
import { OptionsInterface } from '@rockts-org/nestjs-common';
import { TypeOrmConfigMetaDataOptions } from '@rockts-org/nestjs-typeorm-config/src/typeorm-config.types';
import { Repository } from 'typeorm';
import { UserSettingsInterface } from './user-settings.interface';
import { UserInterface } from './user.interface';

export interface UserOptionsInterface extends OptionsInterface {
  settings?: UserSettingsInterface;
}

export interface UserOrmFeatureOptionsInterface
  extends TypeOrmConfigMetaDataOptions {
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
