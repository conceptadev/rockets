import { PlainLiteralObject } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ConfigurableCrudBuilder,
  ConfigurableCrudOptions,
} from '@concepta/nestjs-crud';
import {
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlReplaceOne,
  AccessControlUpdateOne,
} from '@concepta/nestjs-access-control';
import {
  DeepPartial,
  UserProfileCreatableInterface,
} from '@concepta/nestjs-common';
import { USER_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN } from '../user.constants';
import { UserProfileSqliteEntity } from '@concepta/nestjs-typeorm-ext';
import { UserProfileDto } from '../dto/profile/user-profile.dto';
import { UserProfilePaginatedDto } from '../dto/profile/user-profile-paginated.dto';
import { UserProfileCreateDto } from '../dto/profile/user-profile-create.dto';
import { UserProfileUpdateDto } from '../dto/profile/user-profile-update.dto';
import { UserProfileEntityInterface } from '@concepta/nestjs-common';
import { UserProfileResource } from '../user.types';

const userProfileCrudBuilderDefaultOptions: ConfigurableCrudOptions = {
  service: {
    entity: UserProfileSqliteEntity,
    injectionToken: USER_MODULE_CONFIGURABLE_CRUD_PROFILE_SERVICE_TOKEN,
  },
  controller: {
    path: 'user-profile',
    model: {
      type: UserProfileDto,
      paginatedType: UserProfilePaginatedDto,
    },
    extraDecorators: [ApiTags('user-profile')],
  },
  getMany: {
    extraDecorators: [AccessControlReadMany(UserProfileResource.Many)],
  },
  getOne: {
    extraDecorators: [AccessControlReadOne(UserProfileResource.One)],
  },
  createOne: {
    dto: UserProfileCreateDto,
    extraDecorators: [AccessControlCreateOne(UserProfileResource.One)],
  },
  updateOne: {
    dto: UserProfileUpdateDto,
    extraDecorators: [AccessControlUpdateOne(UserProfileResource.One)],
  },
  replaceOne: {
    dto: UserProfileUpdateDto,
    extraDecorators: [AccessControlReplaceOne(UserProfileResource.One)],
  },
  deleteOne: {
    extraDecorators: [AccessControlDeleteOne(UserProfileResource.One)],
  },
  recoverOne: {
    path: 'recover/:id',
    extraDecorators: [AccessControlRecoverOne(UserProfileResource.One)],
  },
};

export class UserProfileCrudBuilder<
  Entity extends UserProfileEntityInterface = UserProfileEntityInterface,
  Creatable extends DeepPartial<Entity> &
    UserProfileCreatableInterface = DeepPartial<Entity> &
    UserProfileCreatableInterface,
  Updatable extends DeepPartial<Entity> = DeepPartial<Entity>,
  Replaceable extends Creatable = Creatable,
  ExtraOptions extends PlainLiteralObject = PlainLiteralObject,
> extends ConfigurableCrudBuilder<
  Entity,
  Creatable,
  Updatable,
  Replaceable,
  ExtraOptions
> {
  constructor(options?: ConfigurableCrudOptions) {
    super(options ?? userProfileCrudBuilderDefaultOptions);
  }
}
