import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConfigurableCrudOptions,
  ConfigurableCrudOptionsTransformer,
  CrudModule,
} from '@concepta/nestjs-crud';
import { EventModule } from '@concepta/nestjs-event';

import { ormConfig } from './ormconfig.fixture';
import { UserProfileEntityFixture } from './user-profile.entity.fixture';
import { UserProfileCrudBuilder } from '../utils/user-profile.crud-builder';
import { UserProfileDtoFixture } from './dto/user-profile.dto.fixture';
import { UserProfileCreateDtoFixture } from './dto/user-profile-create.dto.fixture';
import { UserProfileUpdateDtoFixture } from './dto/user-profile-update.dto.fixture';
import { UserCrudModelServiceFixture } from './services/user-crud-model.service.fixture';

type UserProfileExtras = {
  model: {
    type: typeof UserProfileDtoFixture;
  };
  createOne: {
    dto: typeof UserProfileCreateDtoFixture;
  };
  updateOne: {
    dto: typeof UserProfileUpdateDtoFixture;
  };
};

const extras: UserProfileExtras = {
  model: {
    type: UserProfileDtoFixture,
  },
  createOne: {
    dto: UserProfileCreateDtoFixture,
  },
  updateOne: {
    dto: UserProfileUpdateDtoFixture,
  },
};

// update config to use new dto
const myOptionsTransform: ConfigurableCrudOptionsTransformer<
  UserProfileExtras
> = (
  options: ConfigurableCrudOptions,
  extras?: UserProfileExtras,
): ConfigurableCrudOptions => {
  if (!extras) return options;

  options.controller.model.type = extras.model.type;
  options.service.entity = UserProfileEntityFixture;
  if (options.createOne) options.createOne.dto = extras.createOne.dto;
  if (options.updateOne) options.updateOne.dto = extras.updateOne.dto;
  return options;
};

// define profile with custom dtos
const userProfileCrudBuilder = new UserProfileCrudBuilder<
  UserProfileEntityFixture,
  UserProfileCreateDtoFixture,
  UserProfileUpdateDtoFixture,
  UserProfileCreateDtoFixture,
  UserProfileExtras
>();
userProfileCrudBuilder.setExtras(extras, myOptionsTransform);

const { ConfigurableControllerClass, ConfigurableServiceProvider } =
  userProfileCrudBuilder.build();

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot(ormConfig),
    TypeOrmModule.forFeature([UserProfileEntityFixture]),
    CrudModule.forRoot({}),
    EventModule.forRoot({}),
  ],
  providers: [UserCrudModelServiceFixture, ConfigurableServiceProvider],
  exports: [UserCrudModelServiceFixture, ConfigurableServiceProvider],
  controllers: [ConfigurableControllerClass],
})
export class AppModuleUserProfileFixture {}
